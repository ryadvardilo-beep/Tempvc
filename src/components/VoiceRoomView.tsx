import React from 'react';
import { Volume2, Lock, Unlock, UserPlus, LogOut, Radio, Shield, Hash, Sliders } from 'lucide-react';
import { TempVoiceChannel, VoiceMember } from '../types';
import { DiscordEmbedPanel } from './DiscordEmbedPanel';

interface VoiceRoomViewProps {
  channel: TempVoiceChannel;
  currentUser: VoiceMember;
  onControlAction: (action: string) => void;
  onAddGuestMember: () => void;
  onLeaveChannel: () => void;
  onToggleSpeaking: () => void;
  isActionLoading?: boolean;
}

export const VoiceRoomView: React.FC<VoiceRoomViewProps> = ({
  channel,
  currentUser,
  onControlAction,
  onAddGuestMember,
  onLeaveChannel,
  onToggleSpeaking,
  isActionLoading = false,
}) => {
  const isCurrentUserInside = channel.members.some((m) => m.id === currentUser.id);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#313338] overflow-y-auto">
      {/* Voice Room Top Header */}
      <div className="h-12 border-b border-[#232428] px-6 flex items-center justify-between bg-[#313338] shadow-xs">
        <div className="flex items-center gap-3">
          {channel.isLocked ? (
            <Lock className="w-5 h-5 text-rose-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          )}
          <div>
            <h2 className="font-bold text-white text-base leading-tight flex items-center gap-2">
              <span>{channel.name}</span>
              {channel.isLocked && (
                <span className="text-[11px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-medium">
                  Locked
                </span>
              )}
            </h2>
            <div className="text-[11px] text-[#949ba4] flex items-center gap-2">
              <span>المالك: <span className="text-white font-medium">{channel.ownerName}</span></span>
              <span>•</span>
              <span>السعة: <span className="text-white font-medium">{channel.userLimit === 0 ? 'غير محدود (∞)' : channel.userLimit}</span></span>
            </div>
          </div>
        </div>

        {/* Quick Voice Stage Controls */}
        <div className="flex items-center gap-2">
          {isCurrentUserInside && (
            <button
              onClick={onToggleSpeaking}
              title="محاكاة التحدث (Speaking status)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                currentUser.isSpeaking
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-[#dbdee1]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{currentUser.isSpeaking ? 'Speaking 🎙️' : 'Muted'}</span>
            </button>
          )}

          <button
            onClick={onAddGuestMember}
            title="إضافة مستخدم تجريبي للروم الصوتي"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b2d31] hover:bg-[#35373c] text-white text-xs font-semibold transition-colors cursor-pointer border border-[#383a40]"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#5865f2]" />
            <span>+ Add Member</span>
          </button>

          {isCurrentUserInside && (
            <button
              onClick={onLeaveChannel}
              title="مغادرة الروم الصوتي"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave VC</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Voice Stage Grid */}
        <div className="bg-[#2b2d31] rounded-lg p-5 border border-[#232428] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">الأعضاء المتواجدون في الروم</h3>
              <span className="text-xs bg-[#1e1f22] text-[#949ba4] px-2 py-0.5 rounded-full font-mono">
                {channel.members.length} / {channel.userLimit === 0 ? '∞' : channel.userLimit}
              </span>
            </div>
            <span className="text-xs text-[#949ba4]">
              يتم الحذف التلقائي للروم فور خلوه من الأعضاء
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {channel.members.map((member) => (
              <div
                key={member.id}
                className={`bg-[#1e1f22] rounded-lg p-3 flex flex-col items-center text-center relative border transition-all ${
                  member.isSpeaking
                    ? 'border-emerald-500 shadow-md shadow-emerald-950/40 bg-[#1e1f22]'
                    : 'border-[#2b2d31] hover:border-[#383a40]'
                }`}
              >
                {member.isOwner && (
                  <span
                    className="absolute top-2 left-2 text-xs bg-[#f0b232]/20 text-[#f0b232] border border-[#f0b232]/40 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    title="Room Owner"
                  >
                    👑
                  </span>
                )}

                <div className="relative my-1">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className={`w-14 h-14 rounded-full object-cover transition-all ${
                      member.isSpeaking ? 'ring-3 ring-emerald-500 scale-105' : 'ring-1 ring-[#383a40]'
                    }`}
                  />
                  {member.isSpeaking && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#1e1f22]" />
                  )}
                </div>

                <div className="w-full mt-2 truncate">
                  <div className="font-semibold text-white text-xs truncate">{member.name}</div>
                  <div className="text-[10px] text-[#949ba4]">
                    {member.isSpeaking ? 'Speaking...' : 'Connected'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discord Bot Message & 15-Button Control Panel Embed */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Hash className="w-4 h-4 text-[#949ba4]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#949ba4]">
              رسالة التحكم المرسلة تلقائياً من البوت (Embed & 15 Buttons)
            </span>
          </div>
          <DiscordEmbedPanel
            channel={channel}
            currentUser={currentUser}
            onControlAction={onControlAction}
            isActionLoading={isActionLoading}
          />
        </div>
      </div>
    </div>
  );
};
