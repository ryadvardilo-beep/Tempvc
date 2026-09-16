import React from 'react';
import { TempVoiceChannel, VoiceMember } from '../types';

interface DiscordEmbedPanelProps {
  channel: TempVoiceChannel;
  currentUser: VoiceMember;
  onControlAction: (action: string) => void;
  isActionLoading?: boolean;
}

export const DiscordEmbedPanel: React.FC<DiscordEmbedPanelProps> = ({
  channel,
  currentUser,
  onControlAction,
  isActionLoading = false,
}) => {
  const isOwner = currentUser.id === channel.ownerId;
  const isMasterBotOwner = currentUser.id === '1054739108905361469';
  const hasPermission = isOwner || isMasterBotOwner || currentUser.isAdmin;

  // The 8 Cyberpunk Buttons ordered exactly as in user reference IMG_4851
  const cyberButtons = [
    { id: 'lock', label: 'LOCK', tooltip: 'قفل الروم ومنع دخول الأعضاء' },
    { id: 'unlock', label: 'UNLOCK', tooltip: 'فتح الروم للجميع' },
    { id: 'trust', label: 'TRUST', tooltip: 'منح تصريح دخول لعضو' },
    { id: 'block', label: 'BLOCK', tooltip: 'حظر وطرد عضو' },
    { id: 'rename', label: 'RENAME', tooltip: 'تغيير اسم الروم' },
    { id: 'limit', label: 'LIMIT', tooltip: 'تحديد سعة الروم (0-99)' },
    { id: 'kick', label: 'KICK', tooltip: 'طرد عضو من الروم' },
    { id: 'admin', label: 'ADMIN', tooltip: 'إدارة واستلام ملكية الروم' },
  ];

  return (
    <div id="discord-bot-message-panel" className="bg-[#313338] rounded-lg p-4 sm:p-5 text-[#dbdee1] font-sans border border-[#232428] shadow-lg">
      {/* Bot Message Header */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src="/avatar.png"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://i.imgur.com/bvh29zT.png';
          }}
          alt="SEK"
          className="w-10 h-10 rounded-full bg-[#1e1f22] object-cover shrink-0 ring-1 ring-cyan-500/40"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm hover:underline cursor-pointer">SEK</span>
            <span className="bg-[#5865f2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              APP
            </span>
            <span className="text-xs text-[#949ba4]">Today at 4:12 PM</span>
          </div>
        </div>
      </div>

      {/* Embed Container matching the exact Discord screenshot text & formatting */}
      <div className="sm:ml-12 border-l-4 border-[#00e5ff] bg-[#2b2d31]/90 rounded-r-lg p-4 sm:p-5 space-y-4 text-sm leading-relaxed shadow-md">
        {/* Author */}
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <img src="/avatar.png" alt="SEK" className="w-5 h-5 rounded-full object-cover" />
          <span>SEK System • لوحة التحكم بالرومات الصوتية</span>
        </div>

        {/* Title & Welcome */}
        <div className="space-y-1">
          <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
            <span>🔊 لوحة تحكم الروم الصوتي | {channel.name}</span>
          </h2>
          <p className="text-[#dbdee1] text-xs sm:text-sm">
            مرحباً بك يا <strong className="text-white">{channel.ownerName || 'العضو'}</strong> في غرفتك الصوتية! يمكنك إدارة وضبط خصوصية وسعة رومك بسهولة عبر الأزرار الـ 8 أدناه:
          </p>
        </div>

        {/* 8 Buttons Guide */}
        <div className="space-y-3 pt-2 border-t border-[#383a40]">
          {/* Category 1: Access & Privacy */}
          <div className="bg-[#1e1f22]/60 p-3 rounded-md border border-[#383a40]">
            <h4 className="font-bold text-cyan-300 text-xs mb-1.5 flex items-center gap-1.5">
              <span>🛡️ الأمان والخصوصية (Security & Access)</span>
            </h4>
            <ul className="space-y-1 text-xs text-[#dbdee1]">
              <li>• <strong className="text-white">🔒 LOCK:</strong> قفل الروم ومنع دخول الأعضاء غير المصرح لهم.</li>
              <li>• <strong className="text-white">🔓 UNLOCK:</strong> فتح الروم للجميع والسماح بالدخول بحرية.</li>
              <li>• <strong className="text-white">🤝 TRUST:</strong> منح تصريح دخول لعضو محدد حتى لو كان الروم مقفلاً.</li>
              <li>• <strong className="text-white">🚫 BLOCK:</strong> حظر عضو وطرده فورياً ومنعه من دخول الروم نهائياً.</li>
            </ul>
          </div>

          {/* Category 2: Management & Settings */}
          <div className="bg-[#1e1f22]/60 p-3 rounded-md border border-[#383a40]">
            <h4 className="font-bold text-cyan-300 text-xs mb-1.5 flex items-center gap-1.5">
              <span>⚙️ الإعدادات والتحكم (Settings & Management)</span>
            </h4>
            <ul className="space-y-1 text-xs text-[#dbdee1]">
              <li>• <strong className="text-white">✏️ RENAME:</strong> تغيير وتعديل اسم الروم الصوتي.</li>
              <li>• <strong className="text-white">🔢 LIMIT:</strong> تحديد الحد الأقصى لعدد الأشخاص (0-99).</li>
              <li>• <strong className="text-white">👢 KICK:</strong> طرد عضو متواجد حالياً داخل الروم الصوتي.</li>
              <li>• <strong className="text-white">👑 ADMIN:</strong> إدارة ملكية الروم الصوتي (نقل الملكية أو استلامها).</li>
            </ul>
          </div>
        </div>

        {/* Cyber Banner Graphic */}
        <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-[#091530] my-3">
          <img
            src="/voice_banner.jpg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/sek_voice_banner_1789562273846.jpg';
            }}
            alt="SEK Voice Banner"
            className="w-full h-auto object-cover max-h-56 select-none"
          />
        </div>

        {/* 8 Cyberpunk Action Buttons matching user photo IMG_4851 */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#949ba4] font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-cyan-300 font-semibold">أزرار التحكم الذكية الـ 8 (Cyberpunk Interface):</span>
            </span>
            <span className={hasPermission ? 'text-emerald-400' : 'text-amber-400'}>
              {hasPermission ? '✅ لديك صلاحية التحكم' : '⚠️ بعض الأوامر تتطلب ملكية الروم'}
            </span>
          </div>

          {/* 8 Cyber Buttons Grid - Exactly as in screenshot IMG_4851 */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
            {cyberButtons.map((btn) => (
              <button
                key={btn.id}
                id={`btn-${btn.id}`}
                type="button"
                title={`${btn.label} - ${btn.tooltip}`}
                disabled={isActionLoading}
                onClick={() => onControlAction(btn.id)}
                className="group relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl bg-gradient-to-b from-[#0e172e]/90 to-[#060b18]/95 border border-cyan-500/30 hover:border-cyan-400 active:border-purple-500 shadow-[0_0_12px_rgba(0,240,255,0.12)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Neon highlight reflection */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                
                {/* The exact Cyberpunk Badge matching IMG_4851 */}
                <img
                  src={`/buttons/${btn.id}.png`}
                  alt={btn.label}
                  className="w-full max-w-[85px] sm:max-w-[100px] h-auto object-contain transition-transform duration-200 group-hover:scale-105 select-none drop-shadow-[0_0_8px_rgba(0,240,255,0.35)]"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[#949ba4] pt-2 border-t border-[#383a40]/60">
          <span className="font-semibold text-cyan-400">SEK System</span>
          <span>Today at 4:12 PM</span>
        </div>
      </div>
    </div>
  );
};
