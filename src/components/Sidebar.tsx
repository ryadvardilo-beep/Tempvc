import React from 'react';
import { Volume2, Lock, Plus, Users, Mic, Headphones, Settings, ShieldAlert, Sparkles, Hash } from 'lucide-react';
import { TempVoiceChannel, VoiceMember } from '../types';

interface SidebarProps {
  channels: TempVoiceChannel[];
  activeChannelId: string | null;
  currentView: 'interface' | 'voice';
  currentUser: VoiceMember;
  onSelectChannel: (channelId: string) => void;
  onSelectInterfaceView: () => void;
  onJoinTapToCreate: () => void;
  onLeaveCurrentChannel: () => void;
  onToggleUserRole: () => void;
  onOpenConfig: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channels,
  activeChannelId,
  currentView,
  currentUser,
  onSelectChannel,
  onSelectInterfaceView,
  onJoinTapToCreate,
  onLeaveCurrentChannel,
  onToggleUserRole,
  onOpenConfig,
}) => {
  const currentInChannel = channels.find((c) => c.members.some((m) => m.id === currentUser.id));

  return (
    <div id="discord-channel-sidebar" className="w-64 bg-[#2b2d31] flex flex-col h-full select-none border-r border-[#1f2023] shrink-0">
      {/* Server Header */}
      <div className="h-12 border-b border-[#1f2023] px-4 flex items-center justify-between font-bold text-white shadow-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black text-black shrink-0">
            AG
          </div>
          <span className="truncate text-sm font-semibold">AlphaGenerator Community</span>
        </div>
        <button
          onClick={onOpenConfig}
          title="Bot Settings & IDs"
          className="text-[#949ba4] hover:text-white p-1 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Category: Interface & Guide */}
        <div>
          <div className="px-2 text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>📋 BOT INTERFACES</span>
            <span className="text-[10px] text-cyan-400 font-mono">14 ROLES</span>
          </div>

          <button
            onClick={onSelectInterfaceView}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left cursor-pointer ${
              currentView === 'interface'
                ? 'bg-[#35373c] text-white font-medium'
                : 'text-[#949ba4] hover:bg-[#313338] hover:text-[#dbdee1]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm text-cyan-400 font-bold">#⚫️</span>
              <span className="text-sm font-semibold truncate">interface</span>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-1.5 py-0.5 rounded font-mono">
              Guide
            </span>
          </button>
        </div>

        {/* Category: Voice Channels */}
        <div>
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1">
            <span>🔊 VOICE CHANNELS</span>
            <span className="text-[10px] font-mono text-[#5865f2]">AUTO-VC</span>
          </div>

          {/* Tap-to-Create Channel */}
          <button
            id="tap-to-create-button"
            onClick={onJoinTapToCreate}
            className="w-full group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#35373c] text-[#949ba4] hover:text-[#dbdee1] transition-all cursor-pointer border border-dashed border-[#5865f2]/40 bg-[#5865f2]/5 mb-2"
          >
            <div className="flex items-center gap-2 truncate">
              <Plus className="w-4 h-4 text-[#5865f2] group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-semibold text-white">➕ [+] اضغط لإنشاء روم</span>
            </div>
            <span className="text-[10px] bg-[#5865f2] text-white px-1.5 py-0.5 rounded font-medium shadow-xs">
              Instant
            </span>
          </button>

          {/* Active Temp Voice Channels */}
          <div className="space-y-0.5">
            {channels.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#949ba4] bg-[#1e1f22]/30 rounded-md border border-[#232428]">
                لا توجد رومات نشطة حالياً.
                <div className="mt-1 text-[#5865f2] font-medium cursor-pointer" onClick={onJoinTapToCreate}>
                  اضغط "[+] اضغط لإنشاء روم"
                </div>
              </div>
            ) : (
              channels.map((channel) => {
                const isSelected = currentView === 'voice' && activeChannelId === channel.id;
                const isUserInside = channel.members.some((m) => m.id === currentUser.id);

                return (
                  <div key={channel.id} className="space-y-1">
                    <button
                      onClick={() => onSelectChannel(channel.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#35373c] text-white font-medium'
                          : 'text-[#949ba4] hover:bg-[#313338] hover:text-[#dbdee1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {channel.isLocked ? (
                          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <Volume2 className={`w-4 h-4 shrink-0 ${isUserInside ? 'text-emerald-400' : ''}`} />
                        )}
                        <span className="text-sm truncate">{channel.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {channel.isLocked && (
                          <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/40 px-1 rounded">
                            Locked
                          </span>
                        )}
                        <span className="text-xs font-mono text-[#80848e]">
                          {channel.members.length}/{channel.userLimit === 0 ? '∞' : channel.userLimit}
                        </span>
                      </div>
                    </button>

                    {/* Member List */}
                    {channel.members.length > 0 && (
                      <div className="pl-6 pr-2 space-y-0.5">
                        {channel.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-[#1e1f22]/40 text-xs text-[#b5bac1]"
                          >
                            <div className="relative">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className={`w-5 h-5 rounded-full object-cover ${
                                  member.isSpeaking ? 'ring-2 ring-emerald-500' : ''
                                }`}
                              />
                            </div>
                            <span className="truncate flex-1">
                              {member.name}
                              {member.isOwner && (
                                <span className="text-[10px] text-[#f0b232] ml-1 font-bold" title="Room Owner">
                                  👑
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Connected Voice Status Bar */}
      {currentInChannel && (
        <div className="bg-[#1e1f22] p-2.5 border-t border-[#1f2023] flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold text-emerald-400">Voice Connected</div>
              <div className="text-[11px] text-[#949ba4] truncate">{currentInChannel.name}</div>
            </div>
          </div>
          <button
            onClick={onLeaveCurrentChannel}
            className="text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer"
          >
            Leave
          </button>
        </div>
      )}

      {/* User Status Bar */}
      <div className="h-14 bg-[#232428] px-2.5 flex items-center justify-between border-t border-[#1f2023]">
        <div
          onClick={onToggleUserRole}
          title="انقر للتبديل بين دور المالك / المشرف / عضو عادي"
          className="flex items-center gap-2 hover:bg-[#35373c] p-1.5 rounded cursor-pointer max-w-[130px]"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#232428]" />
          </div>
          <div className="truncate text-left">
            <div className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-[#949ba4]">
              {currentUser.isAdmin ? (
                <span className="text-[#f0b232] font-semibold">Admin</span>
              ) : currentUser.isOwner ? (
                <span className="text-cyan-400 font-semibold">Owner</span>
              ) : (
                <span>Member</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center text-[#949ba4]">
          <button
            onClick={onToggleUserRole}
            title="تبديل صلاحية المستخدم (Owner / Admin / Regular)"
            className="p-1.5 hover:text-white hover:bg-[#35373c] rounded transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[#f0b232]" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-[#35373c] rounded transition-colors cursor-pointer">
            <Mic className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-[#35373c] rounded transition-colors cursor-pointer">
            <Headphones className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
