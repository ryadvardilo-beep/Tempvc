import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initDiscordBot, discordClient } from './discordBot.js';
import { getAlgerianAiResponse } from './geminiService.js';
import { COMMANDS_REGISTRY } from './botCommands.js';

const rootDir = process.cwd();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(rootDir, 'public')));

// ==================== Configuration ====================
let config: {
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
  bannerUrl: string;
  aiEnabled: boolean;
  allowedAiChannelId: string | null;
} = {
  name: 'SEK Temp-VC',
  avatar: '/avatar.png',
  botUserId: '1548852512965140541',
  ownerUserId: '1054739108905361469',
  createVcId: process.env.CREATE_VC_ID || '1054739108905361469',
  highStaffRoleIds: (process.env.HIGH_STAFF_ROLE_IDS || '1054739108905361469,1548474673124081795').split(','),
  isTokenConfigured: Boolean(process.env.DISCORD_BOT_TOKEN),
  isLiveBotConnected: false,
  botTag: 'Tempvoice#0001',
  pingMs: 22,
  bannerUrl: '/voice_banner.jpg',
  aiEnabled: true,
  allowedAiChannelId: null,
};

// ==================== In-Memory State ====================
interface VoiceMember {
  id: string;
  name: string;
  avatar: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  isSpeaking?: boolean;
  joinedAt: number;
}

interface TempVC {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  userLimit: number;
  isLocked: boolean;
  createdAt: number;
  members: VoiceMember[];
  category: string;
  trustedUserIds: string[];
  blockedUserIds: string[];
  channelPermissions: {
    defaultRoleConnect: boolean;
    ownerManageChannels: boolean;
    ownerMuteMembers: boolean;
    ownerMoveMembers: boolean;
  };
}

let activeTempVCs: Record<string, TempVC> = {};
let logs: Array<{
  id: string;
  timestamp: string;
  type: string;
  message: string;
  channelId?: string;
  userId?: string;
}> = [];

let staffAlerts: Array<{
  id: string;
  timestamp: string;
  channelName: string;
  requesterName: string;
  requesterId: string;
  rolesMentioned: string[];
}> = [];

// XO Games state: { channelId: { board: Array(9), turn: 'X'|'O', playerX, playerO, winner } }
let xoGames: Record<string, {
  board: Array<string | null>;
  turn: 'X' | 'O';
  playerX: string;
  playerO?: string;
  winner: string | null;
  isDraw: boolean;
}> = {};

function addLog(type: string, message: string, channelId?: string, userId?: string) {
  const logItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toLocaleTimeString('ar-EG', { hour12: false }),
    type,
    message,
    channelId,
    userId,
  };
  logs.unshift(logItem);
  if (logs.length > 100) logs.pop();
}

// Initial seed log
addLog('info', '✅ SEK Temp-VC System • نظام الرومات الصوتية الذكي المتطور (15 زراً)');

// Initial active room
const seedOwnerId = '1054739108905361469';
const seedVcId = 'vc-alpha-main-1';
activeTempVCs[seedVcId] = {
  id: seedVcId,
  name: "🔊 Ahmed's Room",
  ownerId: seedOwnerId,
  ownerName: 'Ahmed',
  userLimit: 10,
  isLocked: false,
  createdAt: Date.now() - 1000 * 60 * 15,
  category: '🔊 VOICE CHANNELS',
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
      id: seedOwnerId,
      name: 'Ahmed',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      isOwner: true,
      isAdmin: true,
      isSpeaking: true,
      joinedAt: Date.now() - 1000 * 60 * 15,
    },
    {
      id: 'usr-guest-2',
      name: 'Karim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      isSpeaking: false,
      joinedAt: Date.now() - 1000 * 60 * 6,
    }
  ]
};

addLog('voice_create', "إنشاء روم صوتي تلقائي: 🔊 Ahmed's Room بواسطة Ahmed", seedVcId, seedOwnerId);

// ==================== API Endpoints ====================

// GET /api/status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    config: {
      ...config,
      activeChannelsCount: Object.keys(activeTempVCs).length,
      uptimeSeconds: Math.floor(process.uptime()),
    },
  });
});

// GET /api/channels
app.get('/api/channels', (req: Request, res: Response) => {
  res.json({
    activeTempVCs: Object.values(activeTempVCs),
    createVcId: config.createVcId,
  });
});

// POST /api/channels/join (Simulation endpoint)
app.post('/api/channels/join', (req: Request, res: Response) => {
  const { channelId, user } = req.body;
  const userName = user?.name || 'User_' + Math.floor(Math.random() * 1000);
  const userId = user?.id || 'usr-' + Math.floor(Math.random() * 10000);
  const avatar = user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userName}`;

  // If user clicked/joined "Tap to Create"
  if (channelId === config.createVcId || channelId === 'tap-to-create') {
    const newChannelId = `temp-vc-${Date.now()}`;
    const newChannelName = `🔊 ${userName}'s Room`;

    const newChannel: TempVC = {
      id: newChannelId,
      name: newChannelName,
      ownerId: userId,
      ownerName: userName,
      userLimit: 10,
      isLocked: false,
      createdAt: Date.now(),
      category: '🔊 VOICE CHANNELS',
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
          id: userId,
          name: userName,
          avatar,
          isOwner: true,
          isAdmin: user?.isAdmin || false,
          isSpeaking: false,
          joinedAt: Date.now(),
        },
      ],
    };

    activeTempVCs[newChannelId] = newChannel;
    addLog('voice_create', `إنشاء روم صوتي خاص: ${newChannelName} للمستخدم ${userName}`, newChannelId, userId);

    return res.json({
      success: true,
      action: 'created_temp_vc',
      channel: newChannel,
      message: `تم إنشاء غرفتك الصوتية ونقلك إليها: ${newChannelName}`,
    });
  }

  // If user joined existing temp VC
  const targetChannel = activeTempVCs[channelId];
  if (!targetChannel) {
    return res.status(404).json({ error: 'الروم الصوتي غير موجود' });
  }

  // Check Blocked list
  if (targetChannel.blockedUserIds.includes(userId)) {
    return res.status(403).json({ error: '🚫 أنت محظور من دخول هذا الروم الصوتي بواسطة المالك!' });
  }

  // Check Lock list
  const isTrusted = targetChannel.trustedUserIds.includes(userId);
  const isOwner = userId === targetChannel.ownerId;
  const isMasterBotOwner = userId === config.ownerUserId;
  const isAdmin = Boolean(user?.isAdmin);

  if (targetChannel.isLocked && !isOwner && !isTrusted && !isMasterBotOwner && !isAdmin) {
    return res.status(403).json({ error: '🔒 هذا الروم مقفل ولا يسمح بالدخول إلا للأعضاء الموثوقين (Trust)!' });
  }

  // Check limit (0 = unlimited)
  if (targetChannel.userLimit > 0 && targetChannel.members.length >= targetChannel.userLimit) {
    return res.status(400).json({ error: `❌ الروم ممتلئ بالكامل (${targetChannel.userLimit}/${targetChannel.userLimit})` });
  }

  // Remove user from any other temp VCs
  Object.keys(activeTempVCs).forEach((vcId) => {
    activeTempVCs[vcId].members = activeTempVCs[vcId].members.filter((m) => m.id !== userId);
  });

  targetChannel.members.push({
    id: userId,
    name: userName,
    avatar,
    isOwner: userId === targetChannel.ownerId,
    isAdmin: Boolean(user?.isAdmin),
    isSpeaking: false,
    joinedAt: Date.now(),
  });

  addLog('info', `انضم ${userName} إلى الروم: ${targetChannel.name}`, channelId, userId);

  res.json({
    success: true,
    action: 'joined_vc',
    channel: targetChannel,
  });
});

// POST /api/channels/leave
app.post('/api/channels/leave', (req: Request, res: Response) => {
  const { channelId, userId } = req.body;
  const channel = activeTempVCs[channelId];

  if (!channel) {
    return res.status(404).json({ error: 'الروم غير موجود' });
  }

  const leavingMember = channel.members.find((m) => m.id === userId);
  const memberName = leavingMember ? leavingMember.name : 'User';

  channel.members = channel.members.filter((m) => m.id !== userId);
  addLog('info', `غادر ${memberName} الروم: ${channel.name}`, channelId, userId);

  let deleted = false;
  if (channel.members.length === 0) {
    const deletedName = channel.name;
    delete activeTempVCs[channelId];
    delete xoGames[channelId];
    deleted = true;
    addLog('voice_delete', `حذف الروم المؤقت تلقائياً لخلوه من الأعضاء: ${deletedName}`, channelId);
  }

  res.json({
    success: true,
    deleted,
    remainingCount: channel.members?.length || 0,
  });
});

// POST /api/channels/control (ALL 15 ACTIONS from screenshot)
app.post('/api/channels/control', (req: Request, res: Response) => {
  const { channelId, action, userId, targetUserId, newName, limitValue, xoIndex } = req.body;
  const channel = activeTempVCs[channelId];

  if (!channel) {
    return res.status(404).json({ error: 'الروم الصوتي غير موجود' });
  }

  const isOwner = userId === channel.ownerId;
  const isMasterBotOwner = userId === config.ownerUserId;
  const isAdmin = req.body.isAdmin === true;

  // Actions requiring Owner/Admin permission:
  const ownerRequiredActions = ['lock', 'unlock', 'trust', 'untrust', 'block', 'unblock', 'rename', 'limit', 'kick', 'pass_leader'];

  if (ownerRequiredActions.includes(action) && !isOwner && !isMasterBotOwner && !isAdmin) {
    return res.status(403).json({
      error: '❌ هذه ليست رومك الخاصة!',
    });
  }

  // 1. Lock
  if (action === 'lock') {
    channel.isLocked = true;
    channel.channelPermissions.defaultRoleConnect = false;
    addLog('permission', `🔒 تم قفل الروم: ${channel.name} لمنع أي عضو غير مصرح من الدخول.`, channelId, userId);
    return res.json({ success: true, message: '🔒 تم قفل الروم بنجاح.', channel });
  }

  // 2. Unlock
  if (action === 'unlock') {
    channel.isLocked = false;
    channel.channelPermissions.defaultRoleConnect = true;
    addLog('permission', `🔓 تم فتح الروم: ${channel.name} والسماح لجميع الأعضاء بالدخول.`, channelId, userId);
    return res.json({ success: true, message: '🔓 تم فتح الروم للجميع.', channel });
  }

  // 3. Invite
  if (action === 'invite') {
    const inviteLink = `https://discord.gg/temp-vc-${channel.id.slice(-6)}`;
    addLog('info', `📢 إنشاء رابط دعوة مباشر للروم: ${channel.name}`, channelId, userId);
    return res.json({
      success: true,
      message: `📢 تم إنشاء رابط الدعوة السريع للروم: ${inviteLink}`,
      inviteLink,
      channel,
    });
  }

  // 4. Trust
  if (action === 'trust') {
    if (!targetUserId) return res.status(400).json({ error: 'يرجى تحديد العضو لمنحه التصريح' });
    if (!channel.trustedUserIds.includes(targetUserId)) {
      channel.trustedUserIds.push(targetUserId);
    }
    // Also remove from blocked if previously blocked
    channel.blockedUserIds = channel.blockedUserIds.filter((id) => id !== targetUserId);
    addLog('trust', `👥 تم منح تصريح Trust للمستخدم لدخول الروم حتى لو كان مقفلاً`, channelId, userId);
    return res.json({ success: true, message: '👥 تم منح تصريح الدخول للعضو الموثوق بنجاح.', channel });
  }

  // 5. Untrust
  if (action === 'untrust') {
    if (!targetUserId) return res.status(400).json({ error: 'يرجى تحديد العضو لإلغاء التصريح' });
    channel.trustedUserIds = channel.trustedUserIds.filter((id) => id !== targetUserId);
    addLog('trust', `👤 تم إلغاء تصريح العضو الموثوق وإعادته كعضو عادي`, channelId, userId);
    return res.json({ success: true, message: '👤 تم إلغاء تصريح العضو الموثوق.', channel });
  }

  // 6. Block
  if (action === 'block') {
    if (!targetUserId) return res.status(400).json({ error: 'يرجى تحديد العضو لحظره' });
    if (!channel.blockedUserIds.includes(targetUserId)) {
      channel.blockedUserIds.push(targetUserId);
    }
    channel.trustedUserIds = channel.trustedUserIds.filter((id) => id !== targetUserId);
    // Kick from room if inside
    const kickedMember = channel.members.find((m) => m.id === targetUserId);
    channel.members = channel.members.filter((m) => m.id !== targetUserId);
    addLog('block', `🚫 تم طرد وحظر العضو ومنعه من دخول الروم نهائياً`, channelId, userId);
    return res.json({
      success: true,
      message: '🚫 تم طرد وحظر العضو من دخول رومك نهائياً.',
      channel,
    });
  }

  // 7. Unblock
  if (action === 'unblock') {
    if (!targetUserId) return res.status(400).json({ error: 'يرجى تحديد العضو لفك الحظر عنه' });
    channel.blockedUserIds = channel.blockedUserIds.filter((id) => id !== targetUserId);
    addLog('block', `⭕ تم إلغاء الحظر عن العضو والسماح له بالدخول مجدداً`, channelId, userId);
    return res.json({ success: true, message: '⭕ تم إلغاء الحظر عن العضو بنجاح.', channel });
  }

  // 8. Rename
  if (action === 'rename') {
    if (!newName || newName.trim().length === 0) {
      return res.status(400).json({ error: 'يرجى إدخال اسم صحيح للروم' });
    }
    const cleanName = newName.trim().slice(0, 50);
    const formattedName = cleanName.startsWith('🔊') ? cleanName : `🔊 ${cleanName}`;
    const oldName = channel.name;
    channel.name = formattedName;
    addLog('rename', `✏️ تم تغيير اسم الروم من "${oldName}" إلى "${formattedName}"`, channelId, userId);
    return res.json({
      success: true,
      message: `✅ تم تغيير اسم الروم إلى: **${formattedName}**`,
      channel,
    });
  }

  // 9. Limit
  if (action === 'limit') {
    const limitNum = parseInt(limitValue, 10);
    if (isNaN(limitNum) || limitNum < 0 || limitNum > 99) {
      return res.status(400).json({ error: 'السعة يجب أن تكون بين 0 و 99 (0 = لا نهائي)' });
    }
    channel.userLimit = limitNum;
    addLog('permission', `🔢 تم تحديد سعة الروم إلى: ${limitNum === 0 ? 'غير محدود (∞)' : limitNum}`, channelId, userId);
    return res.json({
      success: true,
      message: `🔢 تم تحديد سعة الروم إلى: **${limitNum === 0 ? 'لا نهائي' : limitNum}**`,
      channel,
    });
  }

  // 10. Info
  if (action === 'info') {
    const infoData = {
      name: channel.name,
      owner: channel.ownerName,
      ownerId: channel.ownerId,
      membersCount: channel.members.length,
      userLimit: channel.userLimit === 0 ? 'غير محدود (∞)' : channel.userLimit,
      isLocked: channel.isLocked,
      trustedCount: channel.trustedUserIds.length,
      blockedCount: channel.blockedUserIds.length,
      createdAt: new Date(channel.createdAt).toLocaleString('ar-EG'),
    };
    return res.json({
      success: true,
      message: '📜 معلومات وإحصائيات الروم الصوتي',
      info: infoData,
      channel,
    });
  }

  // 11. Kick
  if (action === 'kick') {
    if (!targetUserId) return res.status(400).json({ error: 'يرجى اختيار العضو لطرده' });
    if (targetUserId === channel.ownerId) {
      return res.status(400).json({ error: 'لا يمكن طرد مالك الروم!' });
    }
    const kickedMember = channel.members.find((m) => m.id === targetUserId);
    const kickedName = kickedMember ? kickedMember.name : 'عضو';
    channel.members = channel.members.filter((m) => m.id !== targetUserId);
    addLog('kick', `📞 تم طرد العضو ${kickedName} من الروم الصوتي`, channelId, userId);
    return res.json({
      success: true,
      message: `📞 تم طرد العضو ${kickedName} من الروم الصوتي بنجاح.`,
      channel,
    });
  }

  // 12. Pass Leader
  if (action === 'pass_leader') {
    if (!targetUserId) return res.status(400).json({ error: 'يرجى اختيار العضو لنقل الملكية له' });
    const newOwnerMember = channel.members.find((m) => m.id === targetUserId);
    if (!newOwnerMember) {
      return res.status(400).json({ error: 'يجب أن يكون العضو متواجداً داخل الروم لنقل الملكية إليه' });
    }
    channel.ownerId = targetUserId;
    channel.ownerName = newOwnerMember.name;
    // Update isOwner tags
    channel.members.forEach((m) => {
      m.isOwner = m.id === targetUserId;
    });
    addLog('claim', `🔄 تم نقل ملكية الروم الصوتي إلى: ${newOwnerMember.name}`, channelId, userId);
    return res.json({
      success: true,
      message: `🔄 تم نقل ملكية الروم بالكامل إلى: **${newOwnerMember.name}**`,
      channel,
    });
  }

  // 13. Claim
  if (action === 'claim') {
    // Check if user is inside
    const currentMember = channel.members.find((m) => m.id === userId);
    if (!currentMember) {
      return res.status(400).json({ error: 'يجب أن تكون داخل الروم الصوتي لتتمكن من استلام الملكية!' });
    }

    // Check if original owner is inside
    const ownerStillInside = channel.members.some((m) => m.id === channel.ownerId);
    if (ownerStillInside && channel.ownerId !== userId) {
      return res.status(400).json({ error: '👑 لا يمكن استلام الملكية طالما مالك الروم متواجد بالداخل!' });
    }

    channel.ownerId = userId;
    channel.ownerName = currentMember.name;
    channel.members.forEach((m) => {
      m.isOwner = m.id === userId;
    });

    addLog('claim', `👑 تم استلام ملكية الروم الصوتي بنجاح بواسطة: ${currentMember.name}`, channelId, userId);
    return res.json({
      success: true,
      message: `👑 مبروك! لقد أصبحت المالك الجديد للروم الصوتي.`,
      channel,
    });
  }

  // 14. XO Game
  if (action === 'xo_game') {
    if (!xoGames[channelId]) {
      xoGames[channelId] = {
        board: Array(9).fill(null),
        turn: 'X',
        playerX: userId,
        winner: null,
        isDraw: false,
      };
      addLog('game', `🎮 تم بدء تحدي لعبة XO جديدة داخل الروم: ${channel.name}`, channelId, userId);
      return res.json({
        success: true,
        message: '🎮 تم تشغيل لعبة XO داخل الروم! العب دورك الآن.',
        gameState: xoGames[channelId],
        channel,
      });
    }

    const game = xoGames[channelId];

    // If reset requested
    if (req.body.reset) {
      xoGames[channelId] = {
        board: Array(9).fill(null),
        turn: 'X',
        playerX: userId,
        winner: null,
        isDraw: false,
      };
      return res.json({
        success: true,
        message: '🎮 تم إعادة بدء لعبة XO!',
        gameState: xoGames[channelId],
        channel,
      });
    }

    // Make move
    if (typeof xoIndex === 'number' && xoIndex >= 0 && xoIndex < 9) {
      if (!game.board[xoIndex] && !game.winner && !game.isDraw) {
        game.board[xoIndex] = game.turn;

        // Check win patterns
        const lines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of lines) {
          if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
            game.winner = game.board[a];
            break;
          }
        }

        if (!game.winner && game.board.every((cell) => cell !== null)) {
          game.isDraw = true;
        }

        if (!game.winner && !game.isDraw) {
          game.turn = game.turn === 'X' ? 'O' : 'X';
        }

        return res.json({
          success: true,
          gameState: game,
          channel,
        });
      }
    }

    return res.json({
      success: true,
      gameState: game,
      channel,
    });
  }

  // 15. Staff Help
  if (action === 'staff_help' || action === 'get_staff') {
    const isInside = channel.members.some((m) => m.id === userId);
    if (!isInside) {
      return res.status(400).json({ error: '❌ يجب أن تكون داخل الروم لطلب المشرفين!' });
    }

    const requester = channel.members.find((m) => m.id === userId)?.name || 'User';
    const staffMentions = config.highStaffRoleIds.map((id) => `<@&${id}>`).join(' ');

    const alert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour12: false }),
      channelName: channel.name,
      requesterName: requester,
      requesterId: userId,
      rolesMentioned: config.highStaffRoleIds,
    };
    staffAlerts.unshift(alert);
    if (staffAlerts.length > 20) staffAlerts.pop();

    const staffMessage = `🚨 نداء عاجل من @${requester}! ${staffMentions} يرجى الدخول إلى الروم الصوتية فوراً.`;
    addLog('staff_alert', staffMessage, channelId, userId);

    return res.json({
      success: true,
      message: '✅ تم إرسال النداء لطاقم إدارة السيرفر بنجاح.',
      alert,
      staffMessage,
      channel,
    });
  }

  return res.status(400).json({ error: 'أمر غير معروف' });
});

// GET /api/logs
app.get('/api/logs', (req: Request, res: Response) => {
  res.json({ logs, staffAlerts });
});

// POST /api/config
app.post('/api/config', (req: Request, res: Response) => {
  const { createVcId, ownerUserId, highStaffRoleIds } = req.body;
  if (createVcId) config.createVcId = createVcId;
  if (ownerUserId) config.ownerUserId = ownerUserId;
  if (Array.isArray(highStaffRoleIds)) config.highStaffRoleIds = highStaffRoleIds;

  addLog('info', 'تم تحديث إعدادات البوت والـ IDs بنجاح');
  res.json({ success: true, config });
});

// GET /api/banner
app.get('/api/banner', (req: Request, res: Response) => {
  const bannerPath = path.join(process.cwd(), 'public', 'voice_banner.jpg');
  if (fs.existsSync(bannerPath)) {
    return res.sendFile(bannerPath);
  }
  const altPath = path.join(process.cwd(), 'src', 'assets', 'images', 'sek_voice_banner_1789562273846.jpg');
  if (fs.existsSync(altPath)) {
    return res.sendFile(altPath);
  }
  res.status(404).json({ error: 'Banner image not found' });
});

// GET /api/avatar
app.get('/api/avatar', (req: Request, res: Response) => {
  const avatarPath = path.join(process.cwd(), 'public', 'avatar.png');
  if (fs.existsSync(avatarPath)) {
    return res.sendFile(avatarPath);
  }
  const altAvatar = path.join(process.cwd(), 'src', 'assets', 'images', 'sek_bot_avatar_1789562321776.jpg');
  if (fs.existsSync(altAvatar)) {
    return res.sendFile(altAvatar);
  }
  res.status(404).json({ error: 'Avatar image not found' });
});

// POST /api/ai/chat (Gemini AI Algerian Darja API)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { prompt, userName } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'يرجى تقديم نص الرسالة (prompt)' });
  }

  try {
    const reply = await getAlgerianAiResponse(prompt, userName || 'زائر');
    addLog('ai', `استجابة ذكاء اصطناعي لـ ${userName || 'المستخدم'}: "${prompt.slice(0, 30)}"`);
    res.json({ success: true, reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'حدث خطأ في معالجة الذكاء الاصطناعي' });
  }
});

// POST /api/ai/control (Staff / Owner control for AI)
app.post('/api/ai/control', (req: Request, res: Response) => {
  const { enabled, channelId } = req.body;
  if (typeof enabled === 'boolean') {
    config.aiEnabled = enabled;
  }
  if (channelId !== undefined) {
    config.allowedAiChannelId = channelId ? String(channelId) : null;
  }

  addLog(
    'info',
    `تم تعديل إعدادات الذكاء الاصطناعي: ${config.aiEnabled ? 'مفعل' : 'معطل'}${config.allowedAiChannelId ? ` (محصور في القناة: ${config.allowedAiChannelId})` : ' (متاح في كل القنوات)'}`
  );

  res.json({
    success: true,
    aiEnabled: config.aiEnabled,
    allowedAiChannelId: config.allowedAiChannelId,
  });
});

// GET /api/commands (Returns all 50+ registered bot commands)
app.get('/api/commands', (req: Request, res: Response) => {
  const commands = COMMANDS_REGISTRY.map((c) => ({
    name: c.name,
    description: c.description,
    category: c.category,
    options: c.options || [],
  }));
  res.json({ total: commands.length, commands });
});

// POST /api/bot/connect
app.post('/api/bot/connect', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'يرجى تقديم التوكن الصحيح' });
  }

  try {
    process.env.DISCORD_BOT_TOKEN = token;
    config.isTokenConfigured = true;
    initDiscordBot(botContext, token);
    res.json({ success: true, message: 'جاري الاتصال بحساب البوت في ديسكورد...' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bot Shared Context
const botContext = {
  config,
  activeTempVCs,
  xoGames,
  addLog,
};

// Initialize Bot
if (process.env.DISCORD_BOT_TOKEN) {
  initDiscordBot(botContext);
}

// ==================== Vite / Static Middleware ====================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
