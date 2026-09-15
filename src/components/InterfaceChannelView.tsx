import React from 'react';
import { Hash, Search, Bell, Users, Sparkles, Send, Smile, PlusCircle } from 'lucide-react';
import { TempVoiceChannel, VoiceMember } from '../types';
import { DiscordEmbedPanel } from './DiscordEmbedPanel';

interface InterfaceChannelViewProps {
  channel?: TempVoiceChannel;
  currentUser: VoiceMember;
  onControlAction: (action: string) => void;
  isActionLoading?: boolean;
}

export const InterfaceChannelView: React.FC<InterfaceChannelViewProps> = ({
  channel,
  currentUser,
  onControlAction,
  isActionLoading = false,
}) => {
  // If no channel exists yet, create fallback mock data for the guide preview
  const previewChannel: TempVoiceChannel = channel || {
    id: 'vc-preview-demo',
    name: "🔊 Ahmed's Room",
    ownerId: currentUser.id,
    ownerName: currentUser.name,
    userLimit: 10,
    isLocked: false,
    createdAt: Date.now() - 1000 * 60 * 30,
    category: '🔊 VOICE CHANNELS',
    trustedUserIds: [],
    blockedUserIds: [],
    members: [currentUser],
    channelPermissions: {
      defaultRoleConnect: true,
      ownerManageChannels: true,
      ownerMuteMembers: true,
      ownerMoveMembers: true,
    },
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#313338] overflow-hidden">
      {/* Channel Header matching Discord screenshot */}
      <div className="h-12 border-b border-[#232428] px-4 flex items-center justify-between bg-[#313338] shadow-xs select-none">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-cyan-400">#⚫️</span>
          <span className="font-bold text-white text-base">interface</span>
          <span className="text-[#80848e] text-xs font-mono">›</span>
          <span className="text-xs text-[#949ba4] bg-[#2b2d31] px-2 py-0.5 rounded-full border border-[#383a40]">
            14 Roles
          </span>
          <span className="text-xs text-emerald-400 bg-[#2b2d31] px-2 py-0.5 rounded-full border border-[#383a40] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            10 Online
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#949ba4]">
          <Search className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
        {/* The Exact Embed Panel with 15 Buttons and Banner */}
        <DiscordEmbedPanel
          channel={previewChannel}
          currentUser={currentUser}
          onControlAction={onControlAction}
          isActionLoading={isActionLoading}
        />
      </div>

      {/* Bottom Message Input Bar matching screenshot */}
      <div className="p-3 sm:p-4 bg-[#313338] border-t border-[#232428] shrink-0">
        <div className="max-w-4xl mx-auto bg-[#383a40] rounded-lg p-2.5 flex items-center gap-3">
          <button className="text-[#949ba4] hover:text-white transition-colors cursor-pointer">
            <PlusCircle className="w-5 h-5" />
          </button>

          <input
            type="text"
            readOnly
            value="!clear"
            placeholder="إرسال رسالة في #⚫️interface"
            className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-[#80848e]"
          />

          <div className="flex items-center gap-2 text-[#949ba4]">
            <Smile className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <button className="w-8 h-8 rounded-full bg-[#5865f2] hover:bg-[#4752c4] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
