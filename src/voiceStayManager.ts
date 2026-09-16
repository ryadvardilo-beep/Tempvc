import fs from 'fs';
import path from 'path';
import {
  Client,
  Guild,
  VoiceBasedChannel,
  ChannelType,
} from 'discord.js';
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnection,
  VoiceConnectionStatus,
  entersState,
  createAudioPlayer,
  NoSubscriberBehavior,
} from '@discordjs/voice';

export interface StayGuildConfig {
  channelId: string;
  channelName: string;
  enabled: boolean;
  setByUserId?: string;
  setByUsername?: string;
  updatedAt: string;
}

const STAY_CONFIG_FILE = path.join(process.cwd(), 'stay_voice_config.json');

// In-memory active players map
const activePlayers = new Map<string, ReturnType<typeof createAudioPlayer>>();

/**
 * Loads the persistent stay configuration from disk
 */
export function loadAllStayConfigs(): Record<string, StayGuildConfig> {
  try {
    if (fs.existsSync(STAY_CONFIG_FILE)) {
      const data = fs.readFileSync(STAY_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err: any) {
    console.error('[StayManager] Error reading stay config:', err.message);
  }
  return {};
}

/**
 * Saves the stay configuration to disk
 */
export function saveStayConfig(guildId: string, config: StayGuildConfig): void {
  try {
    const all = loadAllStayConfigs();
    all[guildId] = config;
    fs.writeFileSync(STAY_CONFIG_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('[StayManager] Error saving stay config:', err.message);
  }
}

/**
 * Removes or disables stay configuration for a guild
 */
export function disableStayConfig(guildId: string): void {
  try {
    const all = loadAllStayConfigs();
    if (all[guildId]) {
      all[guildId].enabled = false;
      all[guildId].updatedAt = new Date().toISOString();
      fs.writeFileSync(STAY_CONFIG_FILE, JSON.stringify(all, null, 2), 'utf-8');
    }
  } catch (err: any) {
    console.error('[StayManager] Error disabling stay config:', err.message);
  }
}

/**
 * Checks if a guild has 24/7 stay enabled
 */
export function isStayEnabled(guildId: string): boolean {
  const all = loadAllStayConfigs();
  return Boolean(all[guildId] && all[guildId].enabled);
}

/**
 * Gets the configured stay channel ID for a guild
 */
export function getStayConfig(guildId: string): StayGuildConfig | null {
  const all = loadAllStayConfigs();
  return all[guildId] || null;
}

/**
 * Finds a voice or stage channel in the guild by:
 * 1. Exact ID
 * 2. Mention <#ID>
 * 3. Exact Name (case-insensitive)
 * 4. Partial Name match
 */
export function findVoiceChannel(guild: Guild, query?: string): VoiceBasedChannel | null {
  if (!query) return null;
  const cleanQuery = query.trim().replace(/^<#/, '').replace(/>$/, '');

  // 1. Direct ID match
  const byId = guild.channels.cache.get(cleanQuery);
  if (byId && (byId.type === ChannelType.GuildVoice || byId.type === ChannelType.GuildStageVoice)) {
    return byId as VoiceBasedChannel;
  }

  // 2. Exact or partial name match among voice channels
  const voiceChannels = guild.channels.cache.filter(
    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice
  );

  const exactMatch = voiceChannels.find(
    (c) => c.name.toLowerCase() === query.trim().toLowerCase()
  );
  if (exactMatch) return exactMatch as VoiceBasedChannel;

  const partialMatch = voiceChannels.find(
    (c) => c.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  if (partialMatch) return partialMatch as VoiceBasedChannel;

  return null;
}

/**
 * Connects the bot to a voice channel with 24/7 auto-reconnect and keep-alive
 */
export async function joinStayVoiceChannel(
  guild: Guild,
  targetChannel: VoiceBasedChannel,
  userId?: string,
  username?: string
): Promise<{ success: boolean; channelName: string; channelId: string; error?: string }> {
  try {
    const existing = getVoiceConnection(guild.id);
    if (existing && existing.joinConfig.channelId === targetChannel.id && existing.state.status === VoiceConnectionStatus.Ready) {
      // Already connected and ready
      saveStayConfig(guild.id, {
        channelId: targetChannel.id,
        channelName: targetChannel.name,
        enabled: true,
        setByUserId: userId,
        setByUsername: username,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, channelName: targetChannel.name, channelId: targetChannel.id };
    }

    // Join or move connection
    const connection = joinVoiceChannel({
      channelId: targetChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator as any,
      selfDeaf: false,
      selfMute: false,
    });

    // Create and subscribe an audio keep-alive player so Discord never times out the bot
    let player = activePlayers.get(guild.id);
    if (!player) {
      player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });
      activePlayers.set(guild.id, player);
    }
    connection.subscribe(player);

    // Setup auto-reconnect on disconnect
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Reconnected to a new voice gateway
      } catch (e) {
        console.warn(`[Stay 24/7] Bot disconnected from ${targetChannel.name} in ${guild.name}. Checking auto-reconnect...`);
        if (isStayEnabled(guild.id)) {
          setTimeout(async () => {
            if (isStayEnabled(guild.id)) {
              try {
                const refreshedGuild = guild.client.guilds.cache.get(guild.id);
                const refreshedChannel = refreshedGuild?.channels.cache.get(targetChannel.id) as VoiceBasedChannel;
                if (refreshedGuild && refreshedChannel) {
                  await joinStayVoiceChannel(refreshedGuild, refreshedChannel);
                }
              } catch (reconnErr: any) {
                console.error('[Stay 24/7] Reconnect error:', reconnErr.message);
              }
            }
          }, 3000);
        }
      }
    });

    connection.on('error', (err) => {
      console.error(`[Stay 24/7] Connection error in ${guild.name}:`, err.message);
      if (isStayEnabled(guild.id)) {
        setTimeout(async () => {
          if (isStayEnabled(guild.id)) {
            try {
              await joinStayVoiceChannel(guild, targetChannel);
            } catch {}
          }
        }, 3000);
      }
    });

    // Persist to 24/7 configuration
    saveStayConfig(guild.id, {
      channelId: targetChannel.id,
      channelName: targetChannel.name,
      enabled: true,
      setByUserId: userId,
      setByUsername: username,
      updatedAt: new Date().toISOString(),
    });

    console.log(`[Stay 24/7] Successfully joined and locked into VC: "${targetChannel.name}" (${targetChannel.id}) in guild "${guild.name}"`);
    return { success: true, channelName: targetChannel.name, channelId: targetChannel.id };
  } catch (err: any) {
    console.error('[Stay 24/7] Join error:', err);
    return { success: false, channelName: targetChannel.name, channelId: targetChannel.id, error: err.message };
  }
}

/**
 * Leaves the voice channel and disables 24/7 stay for the guild
 */
export async function leaveStayVoiceChannel(guild: Guild): Promise<{ success: boolean; wasConnected: boolean }> {
  disableStayConfig(guild.id);
  const connection = getVoiceConnection(guild.id);
  const player = activePlayers.get(guild.id);
  if (player) {
    player.stop();
    activePlayers.delete(guild.id);
  }

  if (connection) {
    connection.destroy();
    return { success: true, wasConnected: true };
  }
  return { success: true, wasConnected: false };
}

/**
 * Background service to monitor 24/7 stay connections and auto-rejoin if bot was restarted or disconnected
 */
export function initStayVoiceService(client: Client): void {
  const checkAndReconnectAll = async () => {
    try {
      const allConfigs = loadAllStayConfigs();
      for (const [guildId, cfg] of Object.entries(allConfigs)) {
        if (!cfg || !cfg.enabled || !cfg.channelId) continue;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;

        const channel = guild.channels.cache.get(cfg.channelId) as VoiceBasedChannel | undefined;
        if (!channel) continue;

        const connection = getVoiceConnection(guildId);
        const isReady = connection && connection.state.status === VoiceConnectionStatus.Ready;

        if (!isReady) {
          console.log(`[Stay 24/7 Guard] Bot is not in stay voice channel "${cfg.channelName}". Rejoining now...`);
          await joinStayVoiceChannel(guild, channel, cfg.setByUserId, cfg.setByUsername);
        }
      }
    } catch (err: any) {
      console.error('[Stay 24/7 Guard] Check error:', err.message);
    }
  };

  // Run on startup
  setTimeout(checkAndReconnectAll, 3000);

  // Run periodic health check every 25 seconds
  setInterval(checkAndReconnectAll, 25000);
}
