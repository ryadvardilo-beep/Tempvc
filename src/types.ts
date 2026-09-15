export interface VoiceMember {
  id: string;
  name: string;
  avatar: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  isSpeaking?: boolean;
  joinedAt: number;
}

export interface TempVoiceChannel {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  userLimit: number; // 0 for unlimited, 1-99
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

export interface BotConfig {
  name: string;
  avatar: string;
  botUserId: string;
  ownerUserId: string;
  createVcId: string;
  highStaffRoleIds: string[];
  isTokenConfigured: boolean;
  isLiveBotConnected: boolean;
  botTag?: string;
  pingMs: number;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'voice_create' | 'voice_delete' | 'permission' | 'rename' | 'staff_alert' | 'error' | 'kick' | 'claim' | 'trust' | 'block' | 'game';
  message: string;
  channelId?: string;
  userId?: string;
}

export interface StaffAlert {
  id: string;
  timestamp: string;
  channelName: string;
  requesterName: string;
  requesterId: string;
  rolesMentioned: string[];
}
