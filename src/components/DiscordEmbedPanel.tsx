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

  // The 8 Buttons ordered exactly as in user reference IMG_4851 (2 rows of 4)
  const buttonRows = [
    // Row 1: Access & Privacy
    [
      { id: 'lock', emoji: '🔒', label: 'LOCK', tooltip: 'قفل الروم ومنع دخول الأعضاء' },
      { id: 'unlock', emoji: '🔓', label: 'UNLOCK', tooltip: 'فتح الروم للجميع' },
      { id: 'trust', emoji: '🤝', label: 'TRUST', tooltip: 'منح تصريح دخول لعضو' },
      { id: 'block', emoji: '🚫', label: 'BLOCK', tooltip: 'حظر وطرد عضو' },
    ],
    // Row 2: Management & Settings
    [
      { id: 'rename', emoji: '✏️', label: 'RENAME', tooltip: 'تغيير اسم الروم' },
      { id: 'limit', emoji: '🔢', label: 'LIMIT', tooltip: 'تحديد سعة الروم (0-99)' },
      { id: 'kick', emoji: '👢', label: 'KICK', tooltip: 'طرد عضو من الروم' },
      { id: 'admin', emoji: '👑', label: 'ADMIN', tooltip: 'إدارة واستلام ملكية الروم' },
    ],
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

        {/* Cyber Banner Graphic matching IMG_4851 */}
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

        {/* 8 Action Buttons Grid (2 Rows of 4) matching IMG_4851 */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#949ba4] font-medium mb-1">
            <span>لوحة الأزرار التفاعلية الـ 8 (اضغط أي زر لتنفيذ الأمر فوراً):</span>
            <span className={hasPermission ? 'text-emerald-400' : 'text-amber-400'}>
              {hasPermission ? '✅ لديك صلاحية التحكم' : '⚠️ بعض الأوامر تتطلب ملكية الروم'}
            </span>
          </div>

          {buttonRows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {row.map((btn) => (
                <button
                  key={btn.id}
                  id={`btn-${btn.id}`}
                  type="button"
                  title={`${btn.label} - ${btn.tooltip}`}
                  disabled={isActionLoading}
                  onClick={() => onControlAction(btn.id)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#2b2d31] hover:bg-[#35373c] active:bg-[#404249] text-white border border-[#383a40] hover:border-cyan-400 transition-all shadow-sm active:scale-96 cursor-pointer group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    {btn.emoji}
                  </span>
                  <span className="text-xs font-bold font-mono text-[#dbdee1] group-hover:text-cyan-300 tracking-wider">
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          ))}
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
