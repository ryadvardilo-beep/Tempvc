import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  StringSelectMenuBuilder,
  GuildMember,
  VoiceChannel,
  TextChannel,
  CategoryChannel,
  Message,
  Interaction,
  ComponentType,
  AttachmentBuilder,
} from 'discord.js';
import path from 'path';
import fs from 'fs';
import { joinVoiceChannel, getVoiceConnection, VoiceConnection } from '@discordjs/voice';
import { getAlgerianAiResponse } from './geminiService.js';
import { COMMANDS_REGISTRY } from './botCommands.js';

// Shared state references passed from server.ts
export interface BotSharedContext {
  config: {
    name: string;
    avatar: string;
    botUserId: string;
    ownerUserId: string;
    createVcId: string;
    highStaffRoleIds: string[];
    isTokenConfigured: boolean;
    isLiveBotConnected: boolean;
    botTag: string;
    pingMs: number;
    bannerUrl?: string;
    aiEnabled?: boolean;
    allowedAiChannelId?: string | null;
  };
  activeTempVCs: Record<string, any>;
  xoGames: Record<string, any>;
  addLog: (type: string, message: string, channelId?: string, userId?: string) => void;
}

export let discordClient: Client | null = null;
let activeVoiceConnections: Map<string, VoiceConnection> = new Map();

/**
 * Loads the local cyber banner and avatar assets to upload directly as Discord attachments
 */
export function getBannerAndAvatarFiles() {
  const files: AttachmentBuilder[] = [];
  const bannerPath = path.join(process.cwd(), 'public', 'voice_banner.jpg');
  const avatarPath = path.join(process.cwd(), 'public', 'avatar.png');

  let bannerUrl = 'attachment://voice_banner.jpg';
  let hasBanner = false;
  let hasAvatar = false;

  if (fs.existsSync(bannerPath)) {
    files.push(new AttachmentBuilder(bannerPath, { name: 'voice_banner.jpg' }));
    hasBanner = true;
  }
  if (fs.existsSync(avatarPath)) {
    files.push(new AttachmentBuilder(avatarPath, { name: 'avatar.png' }));
    hasAvatar = true;
  }

  return {
    files,
    bannerUrl: hasBanner ? 'attachment://voice_banner.jpg' : 'https://i.imgur.com/bvh29zT.png',
    hasAvatar,
  };
}

/**
 * Creates the 8 buttons matching the exact layout and icons from user reference IMG_4851:
 * Row 1: LOCK, UNLOCK, TRUST, BLOCK
 * Row 2: RENAME, LIMIT, KICK, ADMIN
 */
export function buildVoiceButtonRows(prefix = 'vc'): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`${prefix}_lock`).setLabel('LOCK').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_unlock`).setLabel('UNLOCK').setEmoji('🔓').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_trust`).setLabel('TRUST').setEmoji('🤝').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_block`).setLabel('BLOCK').setEmoji('🚫').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`${prefix}_rename`).setLabel('RENAME').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_limit`).setLabel('LIMIT').setEmoji('🔢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_kick`).setLabel('KICK').setEmoji('👢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_admin`).setLabel('ADMIN').setEmoji('👑').setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2];
}

// Alias for backwards compatibility
export const build15ButtonRows = buildVoiceButtonRows;

/**
 * Creates the interface control embed matching SEK System branding and the 8-button layout
 */
export function buildControlEmbed(
  channelName: string,
  ownerName: string,
  bannerUrl = 'attachment://voice_banner.jpg',
  hasAvatar = true
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x00e5ff)
    .setAuthor({
      name: 'SEK System • لوحة التحكم بالرومات الصوتية',
      iconURL: hasAvatar ? 'attachment://avatar.png' : undefined,
    })
    .setTitle(`🔊 لوحة تحكم الروم الصوتي | ${channelName}`)
    .setDescription(
      `مرحباً بك يا **${ownerName}** في غرفتك الصوتية!\n` +
      `يمكنك إدارة وضبط خصوصية وسعة رومك بسهولة عبر الأزرار الـ 8 أدناه:\n\n` +
      `🛡️ **الأمان والخصوصية (Security & Access)**\n` +
      `• 🔒 **LOCK** : قفل الروم ومنع دخول الأعضاء\n` +
      `• 🔓 **UNLOCK** : فتح الروم للجميع\n` +
      `• 🤝 **TRUST** : منح تصريح دخول لعضو حتى والروم مقفل\n` +
      `• 🚫 **BLOCK** : حظر عضو وطرده فورياً ومنعه من الدخول\n\n` +
      `⚙️ **الإعدادات والتحكم (Settings & Management)**\n` +
      `• ✏️ **RENAME** : تغيير وتعديل اسم الروم الصوتي\n` +
      `• 🔢 **LIMIT** : تحديد الحد الأقصى لعدد الأشخاص (0-99)\n` +
      `• 👢 **KICK** : طرد عضو متواجد حالياً داخل الروم الصوتي\n` +
      `• 👑 **ADMIN** : إدارة ملكية الروم الصوتي (نقل أو استلام الملكية)`
    )
    .setImage(bannerUrl)
    .setFooter({
      text: 'SEK System',
      iconURL: hasAvatar ? 'attachment://avatar.png' : undefined,
    })
    .setTimestamp();

  return embed;
}

/**
 * Initializes and connects the Discord Bot
 */
export function initDiscordBot(ctx: BotSharedContext, token?: string) {
  const botToken = token || process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.log('[Discord Bot] No bot token provided. Bot will run in simulation mode until connected.');
    return;
  }

  if (discordClient) {
    try {
      discordClient.destroy();
    } catch {
      // ignore
    }
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  const client = discordClient;

  client.on('ready', async () => {
    console.log(`[Discord Bot] Ready and logged in as ${client.user?.tag}!`);
    ctx.config.isLiveBotConnected = true;
    ctx.config.isTokenConfigured = true;
    ctx.config.botTag = client.user?.tag || 'Tempvoice#0001';
    ctx.config.botUserId = client.user?.id || ctx.config.botUserId;
    ctx.addLog('info', `✅ تم تسجيل الدخول بنجاح بحساب البوت: ${client.user?.tag}`);

    // Register Slash Commands globally so commands work even without MessageContent intent
    try {
      const coreSlashCommands = [
        {
          name: 'setup',
          description: 'تجهيز وإعداد نظام الرومات الصوتية والكاتيجوري وقناة التحكم بالأزرار',
        },
        {
          name: 'stay',
          description: 'تثبيت البوت في الروم الصوتي الحالي 24/7 دون خروج',
        },
        {
          name: 'leave',
          description: 'إخراج البوت وفصله من الروم الصوتي',
        },
        {
          name: 'say',
          description: 'إرسال رسالة باسم البوت في القناة',
          options: [
            {
              name: 'message',
              description: 'الرسالة التي تريد أن يرسلها البوت',
              type: 3, // STRING
              required: true,
            },
          ],
        },
        {
          name: 'ping',
          description: 'فحص سرعة استجابة البوت (Ping)',
        },
      ];

      // Merge with 50+ expanded commands without duplicates
      const uniqueCommandsMap = new Map<string, any>();
      for (const cmd of [...coreSlashCommands, ...COMMANDS_REGISTRY]) {
        if (!uniqueCommandsMap.has(cmd.name.toLowerCase())) {
          uniqueCommandsMap.set(cmd.name.toLowerCase(), {
            name: cmd.name.toLowerCase(),
            description: cmd.description,
            options: cmd.options || [],
          });
        }
      }
      const allSlashCommands = Array.from(uniqueCommandsMap.values());

      // 1. Clear any guild-specific commands so they don't show up twice alongside global commands!
      for (const guild of client.guilds.cache.values()) {
        try {
          await guild.commands.set([]); // Clears guild-scoped duplicate commands
          console.log(`[Discord Bot] Cleared guild-scoped commands in: ${guild.name} to avoid duplicates`);
        } catch (gErr: any) {
          console.warn(`[Discord Bot] Couldn't clear guild commands in ${guild.name}:`, gErr.message);
        }
      }

      // 2. Register once globally across Discord
      await client.application?.commands.set(allSlashCommands);
      console.log(`[Discord Bot] ${allSlashCommands.length} unique Slash Commands registered globally!`);
      ctx.addLog('info', `تم ضبط ${allSlashCommands.length} أمراً فريداً (Slash Commands) ومنع التكرار نهائياً`);
    } catch (cmdRegErr: any) {
      console.error('[Discord Bot] Failed to register slash commands:', cmdRegErr.message);
    }
  });

  client.on('error', (err) => {
    console.error('[Discord Bot Error]', err);
    ctx.addLog('error', `خطأ في اتصال البوت: ${err.message}`);
  });

  // ==================== VOICE STATE UPDATES (Temp VC creation & deletion) ====================
  client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
      const guild = newState.guild || oldState.guild;
      const member = newState.member || oldState.member;
      if (!guild || !member || member.user.bot) return;

      // 1. User Joined a Channel
      if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
        const joinedChannel = newState.channel;
        const channelName = joinedChannel?.name?.toLowerCase() || '';

        // Check if user joined "⚫️ tap to create" or any creator/generator channel
        const isCreateTrigger =
          newState.channelId === ctx.config.createVcId ||
          channelName.includes('tap to create') ||
          channelName.includes('create') ||
          channelName.includes('reacte') ||
          channelName.includes('انشاء') ||
          channelName.includes('إنشاء') ||
          channelName.includes('اضغط') ||
          channelName.includes('join to') ||
          channelName.includes('generator') ||
          channelName.includes('صنع');

        if (isCreateTrigger) {
          // Find or fallback category
          const category =
            joinedChannel?.parent ||
            guild.channels.cache.find(
              (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('tempvoice')
            );

          // Create the temporary voice channel
          const tempChannelName = `🔊 ${member.displayName}'s Room`;
          const tempChannel = await guild.channels.create({
            name: tempChannelName,
            type: ChannelType.GuildVoice,
            parent: category?.id,
            permissionOverwrites: [
              {
                id: guild.id, // @everyone
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                  PermissionFlagsBits.Stream,
                  PermissionFlagsBits.UseVAD,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
              {
                id: client.user?.id || '', // The Bot itself
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                  PermissionFlagsBits.ManageChannels,
                  PermissionFlagsBits.MoveMembers,
                  PermissionFlagsBits.MuteMembers,
                  PermissionFlagsBits.DeafenMembers,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.EmbedLinks,
                  PermissionFlagsBits.AttachFiles,
                ],
              },
              {
                id: member.id, // Room Owner (Do NOT give raw ManageChannels as it breaks mobile tap to join)
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                  PermissionFlagsBits.Stream,
                  PermissionFlagsBits.UseVAD,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                  PermissionFlagsBits.MuteMembers,
                  PermissionFlagsBits.DeafenMembers,
                  PermissionFlagsBits.MoveMembers,
                ],
              },
            ],
          });

          // Move the user to the newly created room
          try {
            await newState.setChannel(tempChannel);
          } catch (moveErr: any) {
            console.error('[Discord Bot] Failed to move user to new voice channel:', moveErr.message);
            // If move fails (e.g. missing Move Members permission in server roles)
            try {
              await (tempChannel as any).send({
                content: `⚠️ <@${member.id}> تم إنشاء رومك الصوتي ولكن تعذر نقلك إليه تلقائياً! يرجى التأكد من رفع رتبة البوت أو منحه صلاحية **Move Members / Administrator**. يمكنك الضغط على الروم والدخول مباشرة: <#${tempChannel.id}>`,
              });
            } catch {}
          }

          // Store in activeTempVCs
          ctx.activeTempVCs[tempChannel.id] = {
            id: tempChannel.id,
            name: tempChannel.name,
            ownerId: member.id,
            ownerName: member.displayName,
            userLimit: 0,
            isLocked: false,
            createdAt: Date.now(),
            category: category?.name || 'tempvoice category',
            trustedUserIds: [],
            blockedUserIds: [],
            channelPermissions: {
              defaultRoleConnect: true,
              ownerManageChannels: true,
              ownerMuteMembers: true,
              ownerMoveMembers: true,
            },
            members: [
              {
                id: member.id,
                name: member.displayName,
                avatar: member.displayAvatarURL(),
                isOwner: true,
                isAdmin: member.permissions.has(PermissionFlagsBits.Administrator),
                isSpeaking: false,
                joinedAt: Date.now(),
              },
            ],
          };

          ctx.addLog('voice_create', `إنشاء روم صوتي تلقائي: ${tempChannelName} للعضو ${member.displayName}`, tempChannel.id, member.id);

          // Send the 8-button Control Panel Embed into the newly created voice channel's text chat!
          try {
            const { files, bannerUrl, hasAvatar } = getBannerAndAvatarFiles();
            const embed = buildControlEmbed(tempChannel.name, member.displayName, bannerUrl, hasAvatar);
            const buttonRows = buildVoiceButtonRows('vc');
            await (tempChannel as any).send({
              content: `👋 مرحباً بك <@${member.id}>! هذا هو بانل التحكم الخاص برومك الصوتي.`,
              embeds: [embed],
              components: buttonRows,
              files,
            });
          } catch (embedErr) {
            console.error('Error sending embed to temp voice channel text chat:', embedErr);
          }
        }
      }

      // 2. User Left a Channel
      if (oldState.channelId && oldState.channelId !== newState.channelId) {
        const leftChannel = oldState.channel;
        if (!leftChannel) return;

        // Check if this channel was an active temp VC
        const isTrackedTempVc = Boolean(ctx.activeTempVCs[leftChannel.id]);
        const isTempVoiceCategory = leftChannel.parent?.name.toLowerCase().includes('tempvoice');
        const isNotCreateChannel = leftChannel.id !== ctx.config.createVcId && !leftChannel.name.includes('tap to create');

        if (isTrackedTempVc || (isTempVoiceCategory && isNotCreateChannel)) {
          // Count non-bot members remaining
          const remainingNonBots = leftChannel.members.filter((m) => !m.user.bot).size;

          if (remainingNonBots === 0) {
            // Delete the voice channel after a brief delay
            setTimeout(async () => {
              try {
                const checkChannel = guild.channels.cache.get(leftChannel.id);
                if (checkChannel && (checkChannel as VoiceChannel).members.filter((m) => !m.user.bot).size === 0) {
                  await checkChannel.delete().catch(() => {});
                  delete ctx.activeTempVCs[leftChannel.id];
                  ctx.addLog('voice_leave', `حذف الروم الصوتي ${leftChannel.name} لخروج جميع الأعضاء منه`, leftChannel.id);
                }
              } catch (delErr) {
                console.error('Failed to auto-delete empty voice channel:', delErr);
              }
            }, 1500);
          } else if (ctx.activeTempVCs[leftChannel.id]) {
            // Update members list
            ctx.activeTempVCs[leftChannel.id].members = leftChannel.members.map((m) => ({
              id: m.id,
              name: m.displayName,
              avatar: m.displayAvatarURL(),
              isOwner: m.id === ctx.activeTempVCs[leftChannel.id].ownerId,
              isAdmin: m.permissions.has(PermissionFlagsBits.Administrator),
              isSpeaking: false,
              joinedAt: Date.now(),
            }));
          }
        }
      }
    } catch (err: any) {
      console.error('Error in voiceStateUpdate handler:', err);
    }
  });

  // ==================== TEXT COMMANDS (!setup, ?stay, !9ol, @bot setup, etc.) ====================
  client.on('messageCreate', async (message: Message) => {
    try {
      if (message.author.bot || !message.guild) return;

      // Extract content and check if the bot was directly mentioned (tagged)
      const wasBotMentioned = Boolean(client.user && message.mentions.has(client.user.id));
      let content = message.content.trim();
      if (wasBotMentioned && client.user) {
        content = content.replace(new RegExp(`^<@!?${client.user.id}>\\s*`, 'i'), '').trim();
      }
      const lower = content.toLowerCase();

      // ---------- AI INTERACTION ON BOT MENTION (Algerian Darja Persona) ----------
      if (wasBotMentioned && (!content.startsWith('!') && !content.startsWith('?') && !content.startsWith('/'))) {
        // Check if AI is disabled by Staff
        if (ctx.config.aiEnabled === false) {
          await message.reply('🛑 الذكاء الاصطناعي موقوف حالياً في السيرفر بقرار من الإدارة.').catch(() => {});
          return;
        }

        // Check if AI is locked to a specific channel
        if (ctx.config.allowedAiChannelId && ctx.config.allowedAiChannelId !== message.channel.id) {
          await message.reply(`⚠️ محادثات الذكاء الاصطناعي مسموحة فقط في الروم المخصص: <#${ctx.config.allowedAiChannelId}> تفادياً للإزعاج.`).catch(() => {});
          return;
        }

        // User tagged the bot with a natural conversational sentence!
        const prompt = content || 'السلام عليكم يا خويا واش راك؟';
        await message.channel.sendTyping().catch(() => {});
        const aiAnswer = await getAlgerianAiResponse(prompt, message.author.username);
        await message.reply(aiAnswer);
        ctx.addLog('ai', `محادثة ذكاء اصطناعي (منشن) مع ${message.author.username}: "${prompt.slice(0, 35)}"`, message.channel.id, message.author.id);
        return;
      }

      // ---------- 1. COMMAND: setup OR !setup OR ?setup ----------
      if (lower === 'setup' || lower === '!setup' || lower === '?setup' || lower.startsWith('!setup') || lower.startsWith('?setup')) {
        const hasAdmin =
          message.member?.permissions.has(PermissionFlagsBits.Administrator) ||
          message.member?.permissions.has(PermissionFlagsBits.ManageChannels) ||
          message.author.id === ctx.config.ownerUserId;

        if (!hasAdmin) {
          await message.reply('❌ يجب أن تملك صلاحية `Administrator` أو `Manage Channels` لتشغيل أمر setup!');
          return;
        }

        const replyMsg = await message.reply('⏳ جاري تجهيز نظام الرومات الصوتية (الكاتيجوري، قناة التحكم، وروم الدخول)...');

        try {
          // 1. Create Category "tempvoice category"
          const category = await message.guild.channels.create({
            name: 'tempvoice category',
            type: ChannelType.GuildCategory,
          });

          // 2. Create Text Channel "⚫️-interface"
          const interfaceChannel = await message.guild.channels.create({
            name: '⚫️-interface',
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
              {
                id: message.guild.id, // @everyone
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                deny: [PermissionFlagsBits.SendMessages],
              },
              {
                id: client.user?.id || '',
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.EmbedLinks,
                  PermissionFlagsBits.AttachFiles,
                ],
              },
            ],
          });

          // 3. Create Voice Channel "⚫️ tap to create"
          const tapChannel = await message.guild.channels.create({
            name: '⚫️ tap to create',
            type: ChannelType.GuildVoice,
            parent: category.id,
            permissionOverwrites: [
              {
                id: message.guild.id, // @everyone
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                  PermissionFlagsBits.Stream,
                  PermissionFlagsBits.UseVAD,
                ],
              },
              {
                id: client.user?.id || '',
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.MoveMembers,
                  PermissionFlagsBits.ManageChannels,
                  PermissionFlagsBits.Speak,
                ],
              },
            ],
          });

          // Update context
          ctx.config.createVcId = tapChannel.id;

          // 4. Send the 8-button Control Embed directly into ⚫️-interface
          const { files, bannerUrl, hasAvatar } = getBannerAndAvatarFiles();
          const controlEmbed = buildControlEmbed('SEK Interface', 'جميع الأعضاء', bannerUrl, hasAvatar);
          const buttonRows = buildVoiceButtonRows('vc');

          await interfaceChannel.send({
            embeds: [controlEmbed],
            components: buttonRows,
            files,
          });

          await replyMsg.edit(
            `✅ **تم إعداد وتجهيز نظام الرومات الصوتية بنجاح!**\n` +
            `• 📁 الكاتيجوري: **${category.name}**\n` +
            `• 💬 قناة التحكم: <#${interfaceChannel.id}>\n` +
            `• 🔊 روم الدخول: <#${tapChannel.id}>\n\n` +
            `📌 الآن بمجرد دخول أي عضو إلى <#${tapChannel.id}>، سيقوم البوت بإنشاء روم صوتي خاص به ونقله إليه فورياً وإرسال لوحة التحكم له!`
          );

          ctx.addLog('setup', `تم تنفيذ أمر setup بنجاح وإنشاء الكاتيجوري وقناة التحكم`, interfaceChannel.id, message.author.id);
        } catch (setupErr: any) {
          console.error('Setup error:', setupErr);
          await replyMsg.edit(`❌ حدث خطأ أثناء تنفيذ setup: ${setupErr.message}`);
        }
        return;
      }

      // ---------- 1.5 COMMAND: !panel OR !بانل (Send / Refresh 8-Button Control Panel) ----------
      if (lower === '!panel' || lower === '?panel' || lower === '!بانل' || lower === 'panel') {
        const isAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator) || message.author.id === ctx.config.ownerUserId;
        if (!isAdmin) {
          await message.reply('🚫 هذا الأمر مخصص للمسؤولين فقط لإرسال لوحة التحكم!');
          return;
        }

        try {
          const { files, bannerUrl, hasAvatar } = getBannerAndAvatarFiles();
          const controlEmbed = buildControlEmbed('SEK Interface', 'جميع الأعضاء', bannerUrl, hasAvatar);
          const buttonRows = buildVoiceButtonRows('vc');

          await (message.channel as any).send({
            embeds: [controlEmbed],
            components: buttonRows,
            files,
          });

          await message.reply('✅ **تم إرسال لوحة تحكم SEK System المحدثة (8 أزرار) بنجاح!**');
          ctx.addLog('panel', `تم إرسال لوحة التحكم بواسطة ${message.author.username}`, message.channel.id, message.author.id);
        } catch (err: any) {
          console.error('Panel send error:', err);
          await message.reply(`❌ فشل إرسال لوحة التحكم: ${err.message}`);
        }
        return;
      }

      // ---------- 2. COMMAND: ?stay OR !stay OR stay (Stay in VC 24/7) ----------
      if (lower === '?stay' || lower === '!stay' || lower === 'stay' || lower.startsWith('?stay') || lower.startsWith('!stay')) {
        const userVoiceChannel = message.member?.voice?.channel;
        if (!userVoiceChannel) {
          await message.reply('❌ يجب أن تكون متواجداً داخل روم صوتي لتنفيذ أمر `?stay`!');
          return;
        }

        try {
          const connection = joinVoiceChannel({
            channelId: userVoiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator as any,
            selfDeaf: false,
            selfMute: true,
          });

          activeVoiceConnections.set(message.guild.id, connection);

          await message.reply(
            `🟢 **تم تثبيت البوت في الروم الصوتي <#${userVoiceChannel.id}> بنجاح!**\n` +
            `سيبقى البوت متواجداً داخل الروم **24/7** ولن يخرج أبداً.\n` +
            `*(إذا أردت خروجه لاحقاً يمكنك كتابة \\?leave أو /leave)*`
          );

          ctx.addLog('stay', `تم تثبيت البوت في الروم الصوتي: ${userVoiceChannel.name}`, userVoiceChannel.id, message.author.id);
        } catch (stayErr: any) {
          console.error('Stay command error:', stayErr);
          await message.reply(`❌ تعذر تثبيت البوت في الروم الصوتي: ${stayErr.message}`);
        }
        return;
      }

      // ---------- 2.1 COMMAND: ?leave OR !leave OR leave ----------
      if (lower === '?leave' || lower === '!leave' || lower === 'leave') {
        const existingConnection = activeVoiceConnections.get(message.guild.id) || getVoiceConnection(message.guild.id);
        if (existingConnection) {
          existingConnection.destroy();
          activeVoiceConnections.delete(message.guild.id);
          await message.reply('👋 تم فصل البوت وخروجه من الروم الصوتي بنجاح.');
        } else {
          await message.reply('ℹ️ البوت ليس متصلاً بأي روم صوتي في هذا السيرفر حالياً.');
        }
        return;
      }

      // ---------- 3. COMMAND: !9ol / 9ol / !قول (Say / Echo Command) ----------
      if (lower.startsWith('!9ol') || lower.startsWith('9ol') || lower.startsWith('!قول') || lower.startsWith('قول') || lower.startsWith('!say') || lower.startsWith('say')) {
        // Strip the command trigger
        let rest = content
          .replace(/^!9ol\s*/i, '')
          .replace(/^9ol\s*/i, '')
          .replace(/^!قول\s*/i, '')
          .replace(/^قول\s*/i, '')
          .replace(/^!say\s*/i, '')
          .replace(/^say\s*/i, '')
          .trim();

        // Delete the original message to keep it clean
        await message.delete().catch(() => {});

        // Check if user specified a channel e.g. !9ol #general السلام عليكم
        const mentionedChannel = message.mentions.channels.first() as TextChannel | undefined;
        let targetChannel: TextChannel = message.channel as TextChannel;

        if (mentionedChannel && (mentionedChannel.type === ChannelType.GuildText || mentionedChannel.type === ChannelType.GuildAnnouncement)) {
          targetChannel = mentionedChannel;
          rest = rest.replace(/<#\d+>\s*/, '').trim();
        }

        if (!rest) {
          const warnMsg = await message.channel.send('⚠️ يرجى كتابة الرسالة بعد الأمر. مثال: `!9ol السلام عليكم ورحمة الله`');
          setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
          return;
        }

        await targetChannel.send(rest);
        ctx.addLog('say', `أمر 9ol: أرسل رسالة في <#${targetChannel.id}>: "${rest.slice(0, 40)}"`, targetChannel.id, message.author.id);
        return;
      }

      // ---------- 4. COMMAND: !ping ----------
      if (lower === '!ping' || lower === '?ping' || lower === 'ping') {
        const ping = client.ws.ping;
        await message.reply(`🏓 Pong! سرعة استجابة البوت الحالية: **${ping}ms**`);
        return;
      }

      // ---------- 5. DISPATCH TO 50+ REGISTRY TEXT COMMANDS (!cmd or ?cmd) + ARABIC SHORTCUTS ----------
      const prefixMatch = content.match(/^[!?]([^\s]+)(?:\s+(.*))?$/s);
      if (prefixMatch) {
        let cmdName = prefixMatch[1].toLowerCase();
        const rawArgs = prefixMatch[2] ? prefixMatch[2].trim().split(/\s+/) : [];

        // Arabic shortcuts mapping
        const arabicAliases: Record<string, string> = {
          'بلع': 'lockchat',
          'قفل': 'lockchat',
          'حل': 'unlockchat',
          'فتح': 'unlockchat',
          'اسكت': 'mute',
          'كتم': 'mute',
          'تكلم': 'unmute',
          'فك': 'unmute',
          'طرد': 'kick',
          'بند': 'ban',
          'حظر': 'ban',
          'فك_حظر': 'unban',
          'تحذير': 'warn',
          'انذار': 'warn',
          'مسح': 'clear',
          'تطهير': 'nuke',
          'سلومود': 'slowmode',
          'سجن': 'jail',
          'حبس': 'jail',
          'جايل': 'jail',
          'فك_سجن': 'unjail',
          'فك_حبس': 'unjail',
          'انجايل': 'unjail',
          'ذكاء': 'ai',
          'تحكم_الذكاء': 'aichannel',
          'قناة_الذكاء': 'aichannel',
        };

        if (arabicAliases[cmdName]) {
          cmdName = arabicAliases[cmdName];
        }

        const foundCmd = COMMANDS_REGISTRY.find((c) => c.name.toLowerCase() === cmdName);
        if (foundCmd && foundCmd.executeText) {
          try {
            await foundCmd.executeText(message, rawArgs, ctx);
          } catch (cmdErr: any) {
            console.error(`Error running text command !${cmdName}:`, cmdErr);
            await message.reply(`❌ حدث خطأ أثناء تنفيذ الأمر: ${cmdErr.message}`);
          }
          return;
        }
      }
    } catch (msgErr) {
      console.error('Error handling message:', msgErr);
    }
  });

  // ==================== INTERACTION HANDLER (Slash Commands, Buttons, Modals, Menus) ====================
  client.on('interactionCreate', async (interaction: Interaction) => {
    try {
      if (!interaction.guild) return;

      // Handle Slash Commands (/setup, /stay, /leave, /say, /ping)
      if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        const member = interaction.member as GuildMember;

        // /setup
        if (commandName === 'setup') {
          const hasAdmin =
            member?.permissions.has(PermissionFlagsBits.Administrator) ||
            member?.permissions.has(PermissionFlagsBits.ManageChannels) ||
            member?.id === ctx.config.ownerUserId;

          if (!hasAdmin) {
            await interaction.reply({
              content: '❌ يجب أن تملك صلاحية `Administrator` أو `Manage Channels` لتشغيل أمر setup!',
              ephemeral: true,
            });
            return;
          }

          await interaction.deferReply();

          try {
            const category = await interaction.guild.channels.create({
              name: 'tempvoice category',
              type: ChannelType.GuildCategory,
            });

            const interfaceChannel = await interaction.guild.channels.create({
              name: '⚫️-interface',
              type: ChannelType.GuildText,
              parent: category.id,
              permissionOverwrites: [
                {
                  id: interaction.guild.id,
                  allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                  deny: [PermissionFlagsBits.SendMessages],
                },
                {
                  id: client.user?.id || '',
                  allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.AttachFiles,
                  ],
                },
              ],
            });

            const tapChannel = await interaction.guild.channels.create({
              name: '⚫️ tap to create',
              type: ChannelType.GuildVoice,
              parent: category.id,
              permissionOverwrites: [
                {
                  id: interaction.guild.id,
                  allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.Speak,
                    PermissionFlagsBits.Stream,
                    PermissionFlagsBits.UseVAD,
                  ],
                },
                {
                  id: client.user?.id || '',
                  allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.MoveMembers,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.Speak,
                  ],
                },
              ],
            });

            ctx.config.createVcId = tapChannel.id;

            const { files, bannerUrl, hasAvatar } = getBannerAndAvatarFiles();
            const controlEmbed = buildControlEmbed('SEK Interface', 'جميع الأعضاء', bannerUrl, hasAvatar);
            const buttonRows = buildVoiceButtonRows('vc');

            await interfaceChannel.send({
              embeds: [controlEmbed],
              components: buttonRows,
              files,
            });

            await interaction.editReply(
              `✅ **تم إعداد وتجهيز نظام الرومات الصوتية بنجاح!**\n` +
              `• 📁 الكاتيجوري: **${category.name}**\n` +
              `• 💬 قناة التحكم: <#${interfaceChannel.id}>\n` +
              `• 🔊 روم الدخول: <#${tapChannel.id}>\n\n` +
              `📌 الآن بمجرد دخول أي عضو إلى <#${tapChannel.id}>، سيقوم البوت بإنشاء روم صوتي خاص به ونقله إليه فورياً!`
            );
            ctx.addLog('setup', 'تم تنفيذ /setup بنجاح', interfaceChannel.id, member.id);
          } catch (err: any) {
            console.error('Slash setup error:', err);
            await interaction.editReply(`❌ حدث خطأ أثناء تنفيذ setup: ${err.message}`);
          }
          return;
        }

        // /panel
        if (commandName === 'panel') {
          const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator) || member.id === ctx.config.ownerUserId;
          if (!isAdmin) {
            await interaction.reply({
              content: '🚫 هذا الأمر مخصص للمسؤولين فقط لإرسال لوحة التحكم!',
              ephemeral: true,
            });
            return;
          }

          try {
            await interaction.deferReply({ ephemeral: true });
            const { files, bannerUrl, hasAvatar } = getBannerAndAvatarFiles();
            const controlEmbed = buildControlEmbed('SEK Interface', 'جميع الأعضاء', bannerUrl, hasAvatar);
            const buttonRows = buildVoiceButtonRows('vc');

            if (interaction.channel && 'send' in interaction.channel) {
              await (interaction.channel as any).send({
                embeds: [controlEmbed],
                components: buttonRows,
                files,
              });
              await interaction.editReply('✅ **تم إرسال لوحة التحكم بنجاح في هذه القناة!**');
            } else {
              await interaction.editReply({ embeds: [controlEmbed], components: buttonRows, files });
            }
          } catch (panelErr: any) {
            console.error('Slash panel error:', panelErr);
            await interaction.editReply(`❌ فشل إرسال لوحة التحكم: ${panelErr.message}`);
          }
          return;
        }

        // /stay
        if (commandName === 'stay') {
          const userVoiceChannel = member?.voice?.channel;
          if (!userVoiceChannel) {
            await interaction.reply({
              content: '❌ يجب أن تكون متواجداً داخل روم صوتي لتنفيذ أمر `/stay`!',
              ephemeral: true,
            });
            return;
          }

          try {
            const connection = joinVoiceChannel({
              channelId: userVoiceChannel.id,
              guildId: interaction.guild.id,
              adapterCreator: interaction.guild.voiceAdapterCreator as any,
              selfDeaf: false,
              selfMute: true,
            });

            activeVoiceConnections.set(interaction.guild.id, connection);

            await interaction.reply({
              content: `🟢 **تم تثبيت البوت في الروم الصوتي <#${userVoiceChannel.id}> بنجاح!** سيبقى متواجداً 24/7.`,
            });
            ctx.addLog('stay', `تثبيت البوت في الروم الصوتي عبر /stay: ${userVoiceChannel.name}`, userVoiceChannel.id, member.id);
          } catch (err: any) {
            await interaction.reply({
              content: `❌ تعذر تثبيت البوت: ${err.message}`,
              ephemeral: true,
            });
          }
          return;
        }

        // /leave
        if (commandName === 'leave') {
          const existingConnection = activeVoiceConnections.get(interaction.guild.id) || getVoiceConnection(interaction.guild.id);
          if (existingConnection) {
            existingConnection.destroy();
            activeVoiceConnections.delete(interaction.guild.id);
            await interaction.reply({ content: '👋 تم فصل وخروج البوت من الروم الصوتي بنجاح.' });
          } else {
            await interaction.reply({ content: 'ℹ️ البوت ليس متصلاً بأي روم صوتي حالياً.', ephemeral: true });
          }
          return;
        }

        // /say
        if (commandName === 'say') {
          const messageText = interaction.options.getString('message', true);
          await interaction.channel?.send(messageText);
          await interaction.reply({ content: '✅ تم إرسال الرسالة بنجاح!', ephemeral: true });
          ctx.addLog('say', `أمر /say: "${messageText.slice(0, 40)}"`, interaction.channelId, member.id);
          return;
        }

        // /ping
        if (commandName === 'ping') {
          const ping = client.ws.ping;
          await interaction.reply({ content: `🏓 Pong! سرعة الاستجابة: **${ping}ms**` });
          return;
        }

        // Check registry for any of the 50+ commands
        const registryCmd = COMMANDS_REGISTRY.find((c) => c.name === commandName);
        if (registryCmd && registryCmd.executeSlash) {
          try {
            await registryCmd.executeSlash(interaction, ctx);
          } catch (cmdErr: any) {
            console.error(`Error executing slash command /${commandName}:`, cmdErr);
            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({ content: `❌ حدث خطأ أثناء تنفيذ الأمر: ${cmdErr.message}`, ephemeral: true });
            } else {
              await interaction.followUp({ content: `❌ حدث خطأ أثناء تنفيذ الأمر: ${cmdErr.message}`, ephemeral: true });
            }
          }
          return;
        }
      }

      // Handle Button Clicks
      if (interaction.isButton()) {
        const customId = interaction.customId;
        const member = interaction.member as GuildMember;
        if (!member) return;

        // Determine user's voice channel
        let voiceChannel = member.voice.channel as VoiceChannel | null;

        // If interaction is inside a voice channel's text chat
        if (!voiceChannel && interaction.channel && interaction.channel.type === ChannelType.GuildVoice) {
          voiceChannel = interaction.channel as VoiceChannel;
        }

        if (!voiceChannel) {
          await interaction.reply({
            content: '❌ يجب أن تكون داخل الروم الصوتي الخاص بك لاستخدام هذه الأزرار!',
            ephemeral: true,
          });
          return;
        }

        const tempVcData = ctx.activeTempVCs[voiceChannel.id];
        let isOwner = tempVcData?.ownerId === member.id;
        // Fallback owner recognition (e.g. if bot was restarted on hosting)
        if (!isOwner) {
          const memberName = member.displayName.toLowerCase();
          const memberUser = member.user.username.toLowerCase();
          const chanName = voiceChannel.name.toLowerCase();
          if (chanName.includes(memberName) || chanName.includes(memberUser)) {
            isOwner = true;
            if (tempVcData) {
              tempVcData.ownerId = member.id;
              tempVcData.ownerName = member.displayName;
            }
          }
        }
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator) || member.id === ctx.config.ownerUserId;

        // 1. Lock
        if (customId === 'vc_lock') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه قفل الروم!', ephemeral: true });
            return;
          }
          await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: false,
          });
          if (tempVcData) tempVcData.isLocked = true;
          await interaction.reply({ content: '🔒 تم قفل الروم الصوتي بنجاح! لا يمكن لأحد الدخول إلا المصرح لهم (Trust).', ephemeral: true });
          ctx.addLog('lock', `تم قفل الروم الصوتي: ${voiceChannel.name}`, voiceChannel.id, member.id);
          return;
        }

        // 2. Unlock
        if (customId === 'vc_unlock') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه فتح الروم!', ephemeral: true });
            return;
          }
          await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: true,
          });
          if (tempVcData) tempVcData.isLocked = false;
          await interaction.reply({ content: '🔓 تم فتح الروم الصوتي! يمكن للجميع الدخول الآن.', ephemeral: true });
          ctx.addLog('unlock', `تم فتح الروم الصوتي: ${voiceChannel.name}`, voiceChannel.id, member.id);
          return;
        }

        // 3. Trust (User Select)
        if (customId === 'vc_trust') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه منح تصريح Trust!', ephemeral: true });
            return;
          }
          const userSelect = new UserSelectMenuBuilder()
            .setCustomId(`sel_trust_${voiceChannel.id}`)
            .setPlaceholder('اختر العضو الذي تريد منحه تصريح الدخول (Trust)')
            .setMaxValues(1);

          const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);
          await interaction.reply({ content: '👥 اختر العضو المطلوب:', components: [row], ephemeral: true });
          return;
        }

        // 4. Untrust
        if (customId === 'vc_untrust') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه سحب تصريح Trust!', ephemeral: true });
            return;
          }
          const userSelect = new UserSelectMenuBuilder()
            .setCustomId(`sel_untrust_${voiceChannel.id}`)
            .setPlaceholder('اختر العضو لإلغاء تصريح دخوله')
            .setMaxValues(1);

          const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);
          await interaction.reply({ content: '👤 اختر العضو لإلغاء تصريحه:', components: [row], ephemeral: true });
          return;
        }

        // 5. Invite
        if (customId === 'vc_invite') {
          const invite = await voiceChannel.createInvite({ maxAge: 3600, maxUses: 10 });
          await interaction.reply({
            content: `📢 رابط دعوة سريع لرومك الصوتي:\n${invite.url}`,
            ephemeral: true,
          });
          return;
        }

        // 6. Block
        if (customId === 'vc_block') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه حظر الأعضاء!', ephemeral: true });
            return;
          }
          const userSelect = new UserSelectMenuBuilder()
            .setCustomId(`sel_block_${voiceChannel.id}`)
            .setPlaceholder('اختر العضو لحظره وطرده فورياً من الروم')
            .setMaxValues(1);

          const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);
          await interaction.reply({ content: '🚫 اختر العضو لحظره وطرده:', components: [row], ephemeral: true });
          return;
        }

        // 7. Unblock
        if (customId === 'vc_unblock') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه فك الحظر!', ephemeral: true });
            return;
          }
          const userSelect = new UserSelectMenuBuilder()
            .setCustomId(`sel_unblock_${voiceChannel.id}`)
            .setPlaceholder('اختر العضو لفك الحظر عنه')
            .setMaxValues(1);

          const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);
          await interaction.reply({ content: '⭕ اختر العضو لفك الحظر عنه:', components: [row], ephemeral: true });
          return;
        }

        // 8. Rename (Modal)
        if (customId === 'vc_rename') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه تغيير اسم الروم!', ephemeral: true });
            return;
          }
          const modal = new ModalBuilder()
            .setCustomId(`modal_rename_${voiceChannel.id}`)
            .setTitle('✏️ تغيير اسم الروم الصوتي');

          const input = new TextInputBuilder()
            .setCustomId('new_name')
            .setLabel('الاسم الجديد للروم')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(voiceChannel.name)
            .setMaxLength(32)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
          await interaction.showModal(modal);
          return;
        }

        // 9. Limit (Modal)
        if (customId === 'vc_limit') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه تحديد سعة الروم!', ephemeral: true });
            return;
          }
          const modal = new ModalBuilder()
            .setCustomId(`modal_limit_${voiceChannel.id}`)
            .setTitle('🔢 تحديد سعة الروم الصوتي');

          const input = new TextInputBuilder()
            .setCustomId('new_limit')
            .setLabel('الحد الأقصى للأعضاء (0 يعني غير محدد)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('0 - 99')
            .setMaxLength(2)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
          await interaction.showModal(modal);
          return;
        }

        // 10. Info
        if (customId === 'vc_info') {
          const ownerText = tempVcData ? `<@${tempVcData.ownerId}>` : 'غير معروف';
          const isLockedText = tempVcData?.isLocked ? '🔒 نعم (مقفل)' : '🔓 لا (مفتوح)';
          const limitText = voiceChannel.userLimit ? `${voiceChannel.userLimit} أعضاء` : 'غير محددة (مفتوحة)';

          const infoEmbed = new EmbedBuilder()
            .setColor(0x00e5ff)
            .setTitle(`📜 معلومات الروم الصوتي: ${voiceChannel.name}`)
            .addFields(
              { name: '👑 مالك الروم', value: ownerText, inline: true },
              { name: '👥 المتواجدين حالياً', value: `${voiceChannel.members.size} عضو`, inline: true },
              { name: '🔢 السعة القصوى', value: limitText, inline: true },
              { name: '🔐 حالة القفل', value: isLockedText, inline: true },
              { name: '🆔 معرف الروم', value: `\`${voiceChannel.id}\``, inline: true }
            )
            .setFooter({ text: 'SEK System' });

          await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
          return;
        }

        // 11. Kick
        if (customId === 'vc_kick') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه طرد الأعضاء!', ephemeral: true });
            return;
          }
          const channelMembers = voiceChannel.members.filter((m) => m.id !== member.id && !m.user.bot);
          if (channelMembers.size === 0) {
            await interaction.reply({ content: 'ℹ️ لا يوجد أعضاء آخرين في الروم لطردهم!', ephemeral: true });
            return;
          }

          const select = new StringSelectMenuBuilder()
            .setCustomId(`sel_kick_${voiceChannel.id}`)
            .setPlaceholder('اختر العضو لطرده من الروم')
            .addOptions(
              channelMembers.map((m) => ({
                label: m.displayName,
                value: m.id,
                description: `ID: ${m.id}`,
                emoji: '📞',
              }))
            );

          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
          await interaction.reply({ content: '📞 اختر العضو لطرده من الروم الصوتي:', components: [row], ephemeral: true });
          return;
        }

        // 12. XO Game
        if (customId === 'vc_xo') {
          const gameEmbed = new EmbedBuilder()
            .setColor(0xffaa00)
            .setTitle('🎮 تحدي لعبة XO التفاعلية')
            .setDescription(`بدأ التحدي بواسطة <@${member.id}>!\nالدور الحالي: **X**`);

          // 3x3 XO Buttons
          const rows: ActionRowBuilder<ButtonBuilder>[] = [];
          for (let r = 0; r < 3; r++) {
            const row = new ActionRowBuilder<ButtonBuilder>();
            for (let c = 0; c < 3; c++) {
              const idx = r * 3 + c;
              row.addComponents(
                new ButtonBuilder()
                  .setCustomId(`xo_cell_${voiceChannel.id}_${idx}`)
                  .setLabel('➖')
                  .setStyle(ButtonStyle.Secondary)
              );
            }
            rows.push(row);
          }

          await interaction.reply({ embeds: [gameEmbed], components: rows });
          return;
        }

        // 13. Staff Help
        if (customId === 'vc_staff') {
          const staffMentions = ctx.config.highStaffRoleIds.map((r) => `<@&${r}>`).join(' ');
          await interaction.reply({
            content: `🚨 **نداء مساعدة فوري من <@${member.id}>!**\nيرجى من طاقم الإدارة ${staffMentions} التوجه إلى الروم الصوتي <#${voiceChannel.id}> فوراً.`,
          });
          ctx.addLog('staff_alert', `نداء مساعدة من العضو ${member.displayName} في الروم ${voiceChannel.name}`, voiceChannel.id, member.id);
          return;
        }

        // 14. Pass Leader
        if (customId === 'vc_pass') {
          if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '🚫 فقط مالك الروم يمكنه نقل ملكيته لشخص آخر!', ephemeral: true });
            return;
          }
          const otherMembers = voiceChannel.members.filter((m) => m.id !== member.id && !m.user.bot);
          if (otherMembers.size === 0) {
            await interaction.reply({ content: 'ℹ️ لا يوجد أعضاء متواجدين معك في الروم لنقل الملكية إليهم!', ephemeral: true });
            return;
          }

          const select = new StringSelectMenuBuilder()
            .setCustomId(`sel_pass_${voiceChannel.id}`)
            .setPlaceholder('اختر العضو الجديد ليكون مالك الروم')
            .addOptions(
              otherMembers.map((m) => ({
                label: m.displayName,
                value: m.id,
                description: `ID: ${m.id}`,
                emoji: '👑',
              }))
            );

          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
          await interaction.reply({ content: '🔄 اختر المالك الجديد للروم:', components: [row], ephemeral: true });
          return;
        }

        // 15. Claim
        if (customId === 'vc_claim') {
          if (isOwner) {
            await interaction.reply({ content: '👑 أنت بالفعل مالك هذا الروم!', ephemeral: true });
            return;
          }

          const originalOwnerStillInside = voiceChannel.members.has(tempVcData?.ownerId);
          if (originalOwnerStillInside) {
            await interaction.reply({ content: '❌ لا يمكنك استلام الملكية لأن مالك الروم الأصلي لا يزال متواجداً بالداخل!', ephemeral: true });
            return;
          }

          // Transfer ownership to clicker
          if (tempVcData) {
            tempVcData.ownerId = member.id;
            tempVcData.ownerName = member.displayName;
          }

          await voiceChannel.permissionOverwrites.edit(member.id, {
            Connect: true,
            Speak: true,
            ManageChannels: true,
            MuteMembers: true,
            DeafenMembers: true,
            MoveMembers: true,
          });

          await interaction.reply({
            content: `👑 **مبروك! لقد أصبحت المالك الجديد للروم الصوتي <#${voiceChannel.id}> بنجاح.**`,
          });
          ctx.addLog('claim', `العضو ${member.displayName} استلم ملكية الروم الصوتي`, voiceChannel.id, member.id);
          return;
        }

        // 16. ADMIN (Pass Leader for Owner, Claim for non-owner)
        if (customId === 'vc_admin') {
          if (isOwner || isAdmin) {
            const otherMembers = voiceChannel.members.filter((m) => m.id !== member.id && !m.user.bot);
            if (otherMembers.size === 0) {
              await interaction.reply({
                content: `👑 **أنت مالك الروم الحالي!**\nلا يوجد أعضاء آخرين متواجدين معك في الروم لنقل الملكية إليهم حالياً.`,
                ephemeral: true,
              });
              return;
            }

            const select = new StringSelectMenuBuilder()
              .setCustomId(`sel_pass_${voiceChannel.id}`)
              .setPlaceholder('اختر العضو الجديد ليكون مالك الروم')
              .addOptions(
                otherMembers.map((m) => ({
                  label: m.displayName,
                  value: m.id,
                  description: `ID: ${m.id}`,
                  emoji: '👑',
                }))
              );

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
            await interaction.reply({
              content: '👑 **لوحة إدارة الروم الصوتي (ADMIN)**\nاختر العضو الذي ترغب بنقل ملكية الروم إليه:',
              components: [row],
              ephemeral: true,
            });
            return;
          } else {
            // Non-owner clicked ADMIN: attempt to Claim if owner left
            const originalOwnerStillInside = voiceChannel.members.has(tempVcData?.ownerId);
            if (originalOwnerStillInside) {
              await interaction.reply({
                content: `❌ مالك الروم الأصلي (<@${tempVcData?.ownerId || 'غير معروف'}>) لا يزال متواجداً داخل الروم! لا يمكنك استلام الملكية.`,
                ephemeral: true,
              });
              return;
            }

            // Transfer ownership to clicker
            if (tempVcData) {
              tempVcData.ownerId = member.id;
              tempVcData.ownerName = member.displayName;
            }

            await voiceChannel.permissionOverwrites.edit(member.id, {
              Connect: true,
              Speak: true,
              ManageChannels: true,
              MuteMembers: true,
              DeafenMembers: true,
              MoveMembers: true,
            });

            await interaction.reply({
              content: `👑 **مبروك! لقد استلمت ملكية الروم الصوتي <#${voiceChannel.id}> بنجاح عبر زر ADMIN.**`,
            });
            ctx.addLog('claim', `العضو ${member.displayName} استلم ملكية الروم الصوتي عبر زر ADMIN`, voiceChannel.id, member.id);
            return;
          }
        }
      }

      // Handle Modals
      if (interaction.isModalSubmit()) {
        const customId = interaction.customId;

        // Modal: Rename
        if (customId.startsWith('modal_rename_')) {
          const channelId = customId.replace('modal_rename_', '');
          const newName = interaction.fields.getTextInputValue('new_name').trim();
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            await channel.setName(`🔊 ${newName}`);
            if (ctx.activeTempVCs[channelId]) {
              ctx.activeTempVCs[channelId].name = `🔊 ${newName}`;
            }
            await interaction.reply({ content: `✅ تم تغيير اسم الروم الصوتي إلى: **🔊 ${newName}**`, ephemeral: true });
            ctx.addLog('rename', `تغيير اسم الروم إلى: 🔊 ${newName}`, channelId, interaction.user.id);
          }
          return;
        }

        // Modal: Limit
        if (customId.startsWith('modal_limit_')) {
          const channelId = customId.replace('modal_limit_', '');
          const rawLimit = interaction.fields.getTextInputValue('new_limit').trim();
          const limit = Math.max(0, Math.min(99, parseInt(rawLimit) || 0));
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            await channel.setUserLimit(limit);
            if (ctx.activeTempVCs[channelId]) {
              ctx.activeTempVCs[channelId].userLimit = limit;
            }
            await interaction.reply({
              content: `✅ تم ضبط سعة الروم الصوتي إلى: **${limit === 0 ? 'غير محددة (مفتوحة)' : `${limit} أعضاء`}**`,
              ephemeral: true,
            });
            ctx.addLog('limit', `تعديل سعة الروم إلى: ${limit}`, channelId, interaction.user.id);
          }
          return;
        }
      }

      // Handle User Select Menus
      if (interaction.isUserSelectMenu()) {
        const customId = interaction.customId;
        const targetUserId = interaction.values[0];

        // Trust
        if (customId.startsWith('sel_trust_')) {
          const channelId = customId.replace('sel_trust_', '');
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            await channel.permissionOverwrites.edit(targetUserId, { Connect: true, Speak: true, ViewChannel: true });
            if (ctx.activeTempVCs[channelId] && !ctx.activeTempVCs[channelId].trustedUserIds.includes(targetUserId)) {
              ctx.activeTempVCs[channelId].trustedUserIds.push(targetUserId);
            }
            await interaction.reply({ content: `✅ تم منح العضو <@${targetUserId}> تصريح الدخول (Trust) بنجاح!`, ephemeral: true });
            ctx.addLog('trust', `منح تصريح Trust للعضو: <@${targetUserId}>`, channelId, interaction.user.id);
          }
          return;
        }

        // Untrust
        if (customId.startsWith('sel_untrust_')) {
          const channelId = customId.replace('sel_untrust_', '');
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            await channel.permissionOverwrites.delete(targetUserId).catch(() => {});
            if (ctx.activeTempVCs[channelId]) {
              ctx.activeTempVCs[channelId].trustedUserIds = ctx.activeTempVCs[channelId].trustedUserIds.filter((id: string) => id !== targetUserId);
            }
            await interaction.reply({ content: `✅ تم إلغاء تصريح الدخول للعضو <@${targetUserId}>!`, ephemeral: true });
            ctx.addLog('untrust', `إلغاء تصريح Trust للعضو: <@${targetUserId}>`, channelId, interaction.user.id);
          }
          return;
        }

        // Block
        if (customId.startsWith('sel_block_')) {
          const channelId = customId.replace('sel_block_', '');
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            await channel.permissionOverwrites.edit(targetUserId, { Connect: false, ViewChannel: false });
            // Disconnect if inside
            const targetMember = channel.members.get(targetUserId);
            if (targetMember) {
              await targetMember.voice.disconnect().catch(() => {});
            }
            if (ctx.activeTempVCs[channelId] && !ctx.activeTempVCs[channelId].blockedUserIds.includes(targetUserId)) {
              ctx.activeTempVCs[channelId].blockedUserIds.push(targetUserId);
            }
            await interaction.reply({ content: `🚫 تم حظر العضو <@${targetUserId}> وطرده ومنعه من الدخول نهائياً!`, ephemeral: true });
            ctx.addLog('block', `حظر وطرد العضو: <@${targetUserId}>`, channelId, interaction.user.id);
          }
          return;
        }

        // Unblock
        if (customId.startsWith('sel_unblock_')) {
          const channelId = customId.replace('sel_unblock_', '');
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            await channel.permissionOverwrites.delete(targetUserId).catch(() => {});
            if (ctx.activeTempVCs[channelId]) {
              ctx.activeTempVCs[channelId].blockedUserIds = ctx.activeTempVCs[channelId].blockedUserIds.filter((id: string) => id !== targetUserId);
            }
            await interaction.reply({ content: `⭕ تم فك الحظر عن العضو <@${targetUserId}> بنجاح!`, ephemeral: true });
            ctx.addLog('unblock', `فك الحظر عن العضو: <@${targetUserId}>`, channelId, interaction.user.id);
          }
          return;
        }
      }

      // Handle String Select Menus (Kick, Pass Leader)
      if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        const targetUserId = interaction.values[0];

        // Kick
        if (customId.startsWith('sel_kick_')) {
          const channelId = customId.replace('sel_kick_', '');
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            const targetMember = channel.members.get(targetUserId);
            if (targetMember) {
              await targetMember.voice.disconnect().catch(() => {});
              await interaction.reply({ content: `📞 تم طرد العضو <@${targetUserId}> من الروم الصوتي!`, ephemeral: true });
              ctx.addLog('kick', `طرد العضو: <@${targetUserId}> من الروم الصوتي`, channelId, interaction.user.id);
            } else {
              await interaction.reply({ content: `ℹ️ العضو غير متواجد بالروم حالياً!`, ephemeral: true });
            }
          }
          return;
        }

        // Pass Leader
        if (customId.startsWith('sel_pass_')) {
          const channelId = customId.replace('sel_pass_', '');
          const channel = interaction.guild.channels.cache.get(channelId) as VoiceChannel;
          if (channel) {
            const newOwnerMember = channel.members.get(targetUserId);
            if (newOwnerMember) {
              if (ctx.activeTempVCs[channelId]) {
                ctx.activeTempVCs[channelId].ownerId = targetUserId;
                ctx.activeTempVCs[channelId].ownerName = newOwnerMember.displayName;
              }
              await channel.permissionOverwrites.edit(targetUserId, {
                Connect: true,
                Speak: true,
                ManageChannels: true,
                MuteMembers: true,
                DeafenMembers: true,
                MoveMembers: true,
              });
              await interaction.reply({
                content: `👑 تم نقل ملكية الروم الصوتي بالكامل إلى: <@${targetUserId}> بنجاح!`,
              });
              ctx.addLog('pass_leader', `نقل ملكية الروم للعضو: <@${targetUserId}>`, channelId, interaction.user.id);
            }
          }
          return;
        }
      }
    } catch (interErr) {
      console.error('Error handling interaction:', interErr);
    }
  });

  // Attempt login
  client.login(botToken).catch((loginErr) => {
    console.error('[Discord Bot Login Error]', loginErr.message);
    ctx.config.isLiveBotConnected = false;
    ctx.addLog('error', `فشل تسجيل الدخول بالتوكن: ${loginErr.message}`);
  });

  return client;
}
