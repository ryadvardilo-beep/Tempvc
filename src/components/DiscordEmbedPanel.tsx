import React from 'react';
import { TempVoiceChannel, VoiceMember } from '../types';
import { AlphaBanner } from './AlphaBanner';

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

  // The 15 Buttons ordered exactly as in the user's screenshot (3 rows of 5)
  const buttonRows = [
    // Row 1: Access & Privacy
    [
      { id: 'lock', emoji: '🔒', label: 'Lock', tooltip: 'قفل الروم' },
      { id: 'unlock', emoji: '🔓', label: 'Unlock', tooltip: 'فتح الروم' },
      { id: 'trust', emoji: '👥', label: 'Trust', tooltip: 'منح تصريح دخول' },
      { id: 'untrust', emoji: '👤', label: 'Untrust', tooltip: 'إلغاء تصريح العضو' },
      { id: 'invite', emoji: '📢', label: 'Invite', tooltip: 'رابط دعوة سريع' },
    ],
    // Row 2: Security & Customization
    [
      { id: 'block', emoji: '🚫', label: 'Block', tooltip: 'حظر وطرد عضو' },
      { id: 'unblock', emoji: '⭕', label: 'Unblock', tooltip: 'فك الحظر' },
      { id: 'rename', emoji: '✏️', label: 'Rename', tooltip: 'تغيير الاسم' },
      { id: 'limit', emoji: '🔢', label: 'Limit', tooltip: 'تحديد السعة (0-99)' },
      { id: 'info', emoji: '📜', label: 'Info', tooltip: 'معلومات وإحصائيات' },
    ],
    // Row 3: Management & Extras
    [
      { id: 'kick', emoji: '📞', label: 'Kick', tooltip: 'طرد عضو من الروم' },
      { id: 'xo_game', emoji: '🎮', label: 'XO Game', tooltip: 'لعبة XO تفاعلية' },
      { id: 'staff_help', emoji: '🛠️', label: 'Staff Help', tooltip: 'طلب مساعدة الإدارة' },
      { id: 'pass_leader', emoji: '🔄', label: 'Pass Leader', tooltip: 'نقل الملكية' },
      { id: 'claim', emoji: '👑', label: 'Claim', tooltip: 'استلام الملكية' },
    ],
  ];

  return (
    <div id="discord-bot-message-panel" className="bg-[#313338] rounded-lg p-4 sm:p-5 text-[#dbdee1] font-sans border border-[#232428] shadow-lg">
      {/* Bot Message Header */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src="https://i.imgur.com/bvh29zT.png"
          alt="Tempvoice"
          className="w-10 h-10 rounded-full bg-[#1e1f22] object-cover shrink-0 ring-1 ring-cyan-500/30"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm hover:underline cursor-pointer">Tempvoice</span>
            <span className="bg-[#5865f2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              APP
            </span>
            <span className="text-xs text-[#949ba4]">Yesterday at 3:51 AM</span>
          </div>
        </div>
      </div>

      {/* Embed Container matching the exact Discord screenshot text & formatting */}
      <div className="sm:ml-12 border-l-4 border-[#2b2d31] bg-[#2b2d31]/80 rounded-r-lg p-4 sm:p-5 space-y-4 text-sm leading-relaxed">
        {/* Title & Welcome */}
        <div className="space-y-1">
          <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
            <span>🔊 نظام الرومات الصوتية المؤقتة | Dynamic Temp-VC</span>
          </h2>
          <p className="text-[#dbdee1] text-xs sm:text-sm">
            مرحباً بكم في السيرفر! يوفر لكم البوت نظام رومات صوتية تلقائي وسريع يتيح لك التحكم الكامل في غرفتك الصوتية بمجرد إنشائها.
          </p>
        </div>

        {/* How to create */}
        <div className="space-y-1 bg-[#1e1f22]/50 p-3 rounded-md border border-[#383a40]">
          <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
            <span>📥 كيفية إنشاء غرفتك الخاصة:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs text-[#b5bac1]">
            <li>انضم إلى الروم الصوتي المخصص: <strong className="text-white">[+] اضغط لإنشاء روم</strong>.</li>
            <li>سيقوم البوت فوراً بإنشاء روم صوتي خاص بك ونقلك إليه تلقائياً وبأعلى سرعة.</li>
            <li>ستجد في شات الروم لوحة التحكم المتطورة (15 زراً) للتحكم الكامل بالغرفة.</li>
          </ol>
        </div>

        {/* 15 Buttons Guide */}
        <div className="space-y-3 pt-2 border-t border-[#383a40]">
          <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
            <span>🎛️ دليل شرح وظائف الأزرار الـ 15 (Control Panel Guide):</span>
          </div>

          {/* Category 1: Access & Privacy */}
          <div className="bg-[#1e1f22]/60 p-3 rounded-md border border-[#383a40]">
            <h4 className="font-bold text-cyan-300 text-xs mb-1.5 flex items-center gap-1.5">
              <span>🔒 إدارة الدخول والخصوصية (Access & Privacy)</span>
            </h4>
            <ul className="space-y-1 text-xs text-[#dbdee1]">
              <li>• <strong className="text-white">🔒 Lock:</strong> قفل الروم لمنع أي عضو غير مصرح من الدخول.</li>
              <li>• <strong className="text-white">🔓 Unlock:</strong> فتح الروم والسماح لجميع الأعضاء بالدخول.</li>
              <li>• <strong className="text-white">📢 Invite:</strong> إنشاء وإرسال رابط دعوة سريع ومباشر للروم إلى أصدقائك.</li>
              <li>• <strong className="text-white">👥 Trust:</strong> منح تصريح لعضو محدد لدخول رومك حتى لو كان مقفلاً.</li>
              <li>• <strong className="text-white">👤 Untrust:</strong> إلغاء تصريح العضو الموثوق وإعادته كعضو عادي.</li>
            </ul>
          </div>

          {/* Category 2: Security & Customization */}
          <div className="bg-[#1e1f22]/60 p-3 rounded-md border border-[#383a40]">
            <h4 className="font-bold text-cyan-300 text-xs mb-1.5 flex items-center gap-1.5">
              <span>🛡️ الأمان وتخصيص الروم (Security & Customization)</span>
            </h4>
            <ul className="space-y-1 text-xs text-[#dbdee1]">
              <li>• <strong className="text-white">🚫 Block:</strong> طرد وحظر عضو مزعج ومنعه من دخول رومك نهائياً.</li>
              <li>• <strong className="text-white">⭕ Unblock:</strong> إلغاء الحظر عن العضو والسماح له بالدخول مجدداً.</li>
              <li>• <strong className="text-white">✏️ Rename:</strong> تغيير اسم الروم الصوتي وتخصيصه باسمك أو اسم نشاطك.</li>
              <li>• <strong className="text-white">🔢 Limit:</strong> تحديد الحد الأقصى لسعة الروم (1 - 99 أو 0 لعدد لا نهائي).</li>
              <li>• <strong className="text-white">📜 Info:</strong> عرض إحصائيات ومعلومات الروم، المالك الحالي، والسعة.</li>
            </ul>
          </div>

          {/* Category 3: Management & Extras */}
          <div className="bg-[#1e1f22]/60 p-3 rounded-md border border-[#383a40]">
            <h4 className="font-bold text-cyan-300 text-xs mb-1.5 flex items-center gap-1.5">
              <span>👑 التحكم بالملكية والمساعدة والألعاب (Management & Extras)</span>
            </h4>
            <ul className="space-y-1 text-xs text-[#dbdee1]">
              <li>• <strong className="text-white">📞 Kick:</strong> طرد عضو متواجد حالياً داخل الروم الصوتي.</li>
              <li>• <strong className="text-white">🔄 Pass Leader:</strong> نقل ملكية الروم الصوتي بالكامل لأحد أصدقائك المتواجدين معك.</li>
              <li>• <strong className="text-white">👑 Claim:</strong> استلام ملكية الروم تلقائياً إذا خرج المالك الأصلي من الروم.</li>
              <li>• <strong className="text-white">🎮 XO Game:</strong> تشغيل لعبة XO تفاعلية وتحدي داخل شات الروم للتسلية.</li>
              <li>• <strong className="text-white">🛠️ Staff Help:</strong> طلب مساعدة فورية وإرسال تنبيه لطاقم إدارة السيرفر.</li>
            </ul>
          </div>
        </div>

        {/* Cyber Banner matching image */}
        <AlphaBanner />

        {/* 15 Action Buttons Grid (3 Rows of 5) matching the exact Discord screenshot */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#949ba4] font-medium mb-1">
            <span>لوحة الأزرار التفاعلية الـ 15 (اضغط أي زر لتنفيذ الأمر فوراً):</span>
            <span className={hasPermission ? 'text-emerald-400' : 'text-amber-400'}>
              {hasPermission ? '✅ لديك صلاحية التحكم' : '⚠️ بعض الأوامر تتطلب ملكية الروم'}
            </span>
          </div>

          {buttonRows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {row.map((btn) => (
                <button
                  key={btn.id}
                  id={`btn-${btn.id}`}
                  type="button"
                  title={`${btn.label} - ${btn.tooltip}`}
                  disabled={isActionLoading}
                  onClick={() => onControlAction(btn.id)}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 sm:py-3 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] active:bg-[#404249] text-white border border-[#383a40] hover:border-[#5865f2] transition-all shadow-sm active:scale-96 cursor-pointer group"
                >
                  <span className="text-xl sm:text-lg group-hover:scale-110 transition-transform">
                    {btn.emoji}
                  </span>
                  <span className="text-[11px] font-semibold text-[#dbdee1] group-hover:text-white truncate hidden md:inline">
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
