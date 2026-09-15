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
} from 'discord.js';
import { joinVoiceChannel, getVoiceConnection, VoiceConnection } from '@discordjs/voice';

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
  };
  activeTempVCs: Record<string, any>;
  xoGames: Record<string, any>;
  addLog: (type: string, message: string, channelId?: string, userId?: string) => void;
}

export let discordClient: Client | null = null;
let activeVoiceConnections: Map<string, VoiceConnection> = new Map();

/**
 * Creates the 3 rows of 5 buttons matching the exact layout and emojis from screenshot IMG_4809
 */
export function build15ButtonRows(prefix = 'vc'): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`${prefix}_lock`).setEmoji('🔒').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_unlock`).setEmoji('🔓').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_trust`).setEmoji('👥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_untrust`).setEmoji('👤').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_invite`).setEmoji('📢').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`${prefix}_block`).setEmoji('🚫').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_unblock`).setEmoji('⭕').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_rename`).setEmoji('✏️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_limit`).setEmoji('🔢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_info`).setEmoji('📜').setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`${prefix}_kick`).setEmoji('📞').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_xo`).setEmoji('🎮').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_staff`).setEmoji('🛠️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_pass`).setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${prefix}_claim`).setEmoji('👑').setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2, row3];
}

/**
 * Creates the interface control embed matching the exact text & styling in the user screenshot
 */
export function buildControlEmbed(
  channelName: string,
  ownerName: string,
  bannerUrl = 'https://i.imgur.com/bvh29zT.png'
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x00e5ff)
    .setAuthor({
      name: 'AlphaGenerator Temp-VC System • نظام الرومات الصوتية الذكي',
      iconURL: 'https://i.imgur.com/bvh29zT.png',
    })
    .setTitle(`🔊 لوحة تحكم الروم الصوتي | ${channelName}`)
    .setDescription(
      `مرحباً بك يا **${ownerName}** في غرفتك الصوتية المؤقتة! يمكنك التحكم بالكامل في إعدادات وخصوصية الروم عبر الأزرار أدناه:\n\n` +
      `**🔒 التحكم بالخصوصية والأمان (Access & Privacy)**\n` +
      `• 🔒 **Lock**: قفل الروم ومنع أي شخص من الدخول.\n` +
      `• 🔓 **Unlock**: فتح الروم للجميع.\n` +
      `• 👥 **Trust**: منح تصريح دخول لعضو حتى والروم مقفل.\n` +
      `• 👤 **Untrust**: سحب التصريح من العضو.\n` +
      `• 📢 **Invite**: إنشاء رابط دعوة مباشر لرومك.\n\n` +
      `**⚙️ التحكم بالإعدادات والسعة (Settings & Capacity)**\n` +
      `• 🚫 **Block**: حظر وطرد عضو فورياً ومنعه من الدخول.\n` +
      `• ⭕ **Unblock**: فك الحظر عن العضو.\n` +
      `• ✏️ **Rename**: تغيير اسم الروم الصوتي.\n` +
      `• 🔢 **Limit**: تحديد السعة القصوى لعدد الأشخاص (0-99).\n` +
      `• 📜 **Info**: عرض إحصائيات ومعلومات الروم.\n\n` +
      `**👑 التحكم بالملكية والمساعدة والألعاب (Management & Extras)**\n` +
      `• 📞 **Kick**: طرد عضو متواجد حالياً داخل الروم الصوتي.\n` +
      `• 🔄 **Pass Leader**: نقل ملكية الروم الصوتي بالكامل لأحد أصدقائك المتواجدين معك.\n` +
      `• 👑 **Claim**: استلام ملكية الروم تلقائياً إذا خرج المالك الأصلي من الروم.\n` +
      `• 🎮 **XO Game**: تشغيل لعبة XO وتحدي التفاعلية داخل شات الروم للتسلية.\n` +
      `• 🛠️ **Staff Help**: طلب مساعدة فورية وإرسال تنبيه لطاقم إدارة السيرفر.`
    )
    .setImage(bannerUrl)
    .setFooter({
      text: 'AlphaGenerator Temp-VC System • نظام الرومات الصوتية الذكي',
      iconURL: 'https://i.imgur.com/bvh29zT.png',
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

  client.on('ready', () => {
    console.log(`[Discord Bot] Ready and logged in as ${client.user?.tag}!`);
    ctx.config.isLiveBotConnected = true;
    ctx.config.isTokenConfigured = true;
    ctx.config.botTag = client.user?.tag || 'Tempvoice#0001';
    ctx.config.botUserId = client.user?.id || ctx.config.botUserId;
    ctx.addLog('info', `✅ تم تسجيل الدخول بنجاح بحساب البوت: ${client.user?.tag}`);
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

        // Check if user joined "⚫️ tap to create" or the configured createVcId
        const isCreateTrigger =
          newState.channelId === ctx.config.createVcId ||
          channelName.includes('tap to create') ||
          channelName.includes('اضغط لإنشاء') ||
          channelName.includes('click to create');

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
                allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ViewChannel],
              },
              {
                id: member.id, // Room Owner
                allow: [
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.Speak,
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.ManageChannels,
                  PermissionFlagsBits.MuteMembers,
                  PermissionFlagsBits.DeafenMembers,
                  PermissionFlagsBits.MoveMembers,
                ],
              },
            ],
          });

          // Move the user to the newly created room
          await newState.setChannel(tempChannel).catch((err) => {
            console.error('Failed to move user to new voice channel:', err);
          });

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

          // Send the 15-button Control Panel Embed into the newly created voice channel's text chat!
          try {
            const bannerUrl = ctx.config.bannerUrl || 'https://i.imgur.com/bvh29zT.png';
            const embed = buildControlEmbed(tempChannel.name, member.displayName, bannerUrl);
            const buttonRows = build15ButtonRows('vc');
            await (tempChannel as any).send({
              content: `👋 مرحباً بك <@${member.id}>! هذا هو بانل التحكم الكامل الخاص برومك الصوتي.`,
              embeds: [embed],
              components: buttonRows,
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

  // ==================== TEXT COMMANDS (!setup, ?stay, !9ol, etc.) ====================
  client.on('messageCreate', async (message: Message) => {
    try {
      if (message.author.bot || !message.guild) return;

      const content = message.content.trim();
      const lower = content.toLowerCase();

      // ---------- 1. COMMAND: setup OR !setup ----------
      if (lower === 'setup' || lower === '!setup' || lower === '?setup') {
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
          });

          // Update context
          ctx.config.createVcId = tapChannel.id;

          // 4. Send the 15-button Control Embed directly into ⚫️-interface
          const bannerUrl = ctx.config.bannerUrl || 'https://i.imgur.com/bvh29zT.png';
          const controlEmbed = buildControlEmbed('AlphaGenerator Interface', 'جميع الأعضاء', bannerUrl);
          const buttonRows = build15ButtonRows('vc');

          await interfaceChannel.send({
            embeds: [controlEmbed],
            components: buttonRows,
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

      // ---------- 2. COMMAND: ?stay OR !stay (Stay in VC 24/7) ----------
      if (lower === '?stay' || lower === '!stay' || lower.startsWith('?stay') || lower.startsWith('!stay')) {
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
            `*(إذا أردت خروجه لاحقاً يمكنك كتابة \\?leave)*`
          );

          ctx.addLog('stay', `تم تثبيت البوت في الروم الصوتي: ${userVoiceChannel.name}`, userVoiceChannel.id, message.author.id);
        } catch (stayErr: any) {
          console.error('Stay command error:', stayErr);
          await message.reply(`❌ تعذر تثبيت البوت في الروم الصوتي: ${stayErr.message}`);
        }
        return;
      }

      // ---------- 2.1 COMMAND: ?leave OR !leave ----------
      if (lower === '?leave' || lower === '!leave') {
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
      if (lower.startsWith('!9ol') || lower.startsWith('9ol') || lower.startsWith('!قول')) {
        // Strip the command trigger
        let rest = content.replace(/^!9ol\s*/i, '').replace(/^9ol\s*/i, '').replace(/^!قول\s*/i, '').trim();

        // Delete the original message to keep it clean
        await message.delete().catch(() => {});

        // Check if user specified a channel e.g. !9ol #general السلام عليكم
        const mentionedChannel = message.mentions.channels.first() as TextChannel | undefined;
        let targetChannel: TextChannel = message.channel as TextChannel;

        if (mentionedChannel && (mentionedChannel.type === ChannelType.GuildText || mentionedChannel.type === ChannelType.GuildAnnouncement)) {
          targetChannel = mentionedChannel;
          // remove channel tag e.g. <#123456789>
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
      if (lower === '!ping' || lower === '?ping') {
        const ping = client.ws.ping;
        await message.reply(`🏓 Pong! سرعة استجابة البوت الحالية: **${ping}ms**`);
        return;
      }
    } catch (msgErr) {
      console.error('Error handling message:', msgErr);
    }
  });

  // ==================== INTERACTION HANDLER (Buttons, Modals, Menus) ====================
  client.on('interactionCreate', async (interaction: Interaction) => {
    try {
      if (!interaction.guild) return;

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
        const isOwner = tempVcData?.ownerId === member.id;
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
            .setFooter({ text: 'AlphaGenerator Temp-VC System' });

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
