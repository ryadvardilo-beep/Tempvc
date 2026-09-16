import React, { useState } from 'react';
import { X, Shield, Key, Sliders, ExternalLink, Check, Copy } from 'lucide-react';
import { BotConfig } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  config: BotConfig;
  onClose: () => void;
  onSaveConfig: (updated: { createVcId: string; ownerUserId: string; highStaffRoleIds: string[] }) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveConfig,
}) => {
  const [createVcId, setCreateVcId] = useState(config.createVcId);
  const [ownerUserId, setOwnerUserId] = useState(config.ownerUserId);
  const [staffRoleIds, setStaffRoleIds] = useState(config.highStaffRoleIds.join(', '));
  const [copiedInvite, setCopiedInvite] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rolesArray = staffRoleIds
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    onSaveConfig({
      createVcId: createVcId.trim(),
      ownerUserId: ownerUserId.trim(),
      highStaffRoleIds: rolesArray,
    });
    onClose();
  };

  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.botUserId}&permissions=285212688&scope=bot%20applications.commands`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div id="bot-config-modal-dialog" className="bg-[#313338] w-full max-w-lg rounded-lg shadow-2xl border border-[#232428] overflow-hidden text-[#dbdee1] my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#232428] bg-[#2b2d31]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#5865f2]" />
            <h3 className="font-bold text-white text-base">إعدادات البوت والـ IDs الأساسية</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#949ba4] hover:text-white p-1 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Bot Connection Info */}
          <div className="bg-[#1e1f22] p-3.5 rounded-lg border border-[#2b2d31] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={config.avatar}
                alt="bot avatar"
                className="w-10 h-10 rounded-full object-cover bg-[#2b2d31]"
              />
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{config.name}</span>
                  <span className="text-[10px] bg-[#5865f2] text-white px-1.5 py-0.2 rounded font-bold">
                    BOT
                  </span>
                </div>
                <div className="text-xs text-[#949ba4]">
                  {config.isLiveBotConnected ? (
                    <span className="text-emerald-400 font-medium">● متصل بسيرفرات Discord الحية</span>
                  ) : config.isTokenConfigured ? (
                    <span className="text-amber-400 font-medium">● التوكن مسجل وجاهز</span>
                  ) : (
                    <span className="text-[#949ba4]">● يعمل في وضع المحاكاة التفاعلية (Simulation Mode)</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={copyInvite}
              className="flex items-center gap-1 text-xs bg-[#5865f2] hover:bg-[#4752c4] text-white px-2.5 py-1.5 rounded transition-colors font-medium cursor-pointer"
            >
              {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedInvite ? 'تم النسخ!' : 'رابط الدعوة'}</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
                أيدي روم الإنشاء (CREATE_VC_ID) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={createVcId}
                onChange={(e) => setCreateVcId(e.target.value)}
                placeholder="1054739108905361469"
                required
                className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded px-3 py-2 text-white font-mono text-sm outline-none"
              />
              <p className="text-[11px] text-[#949ba4] mt-1">
                الروم الصوتي الرئيسي الذي يدخله الأعضاء لإنشاء رومهم الخاص تلقائياً.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
                أيدي المالك الأساسي (MY_USER_ID) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={ownerUserId}
                onChange={(e) => setOwnerUserId(e.target.value)}
                placeholder="1054739108905361469"
                required
                className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded px-3 py-2 text-white font-mono text-sm outline-none"
              />
              <p className="text-[11px] text-[#949ba4] mt-1">
                يملك صلاحية التحكم في كافة الرومات المؤقتة حتى وإن لم يكن هو من أنشأها.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
                أيديهات رتب الإدارة العليا (HIGH_STAFF_ROLE_IDS)
              </label>
              <input
                type="text"
                value={staffRoleIds}
                onChange={(e) => setStaffRoleIds(e.target.value)}
                placeholder="1054739108905361469, 1548474673124081795"
                className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded px-3 py-2 text-white font-mono text-sm outline-none"
              />
              <p className="text-[11px] text-[#949ba4] mt-1">
                الرتب التي يتم منشنها عند ضغط زر "Get Staff" (مفصولة بفواصل).
              </p>
            </div>

            {/* AI Control for Staff / Owner */}
            <div className="bg-[#1e1f22] p-3.5 rounded-lg border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                    <span>🧠 تحكم الذكاء الاصطناعي (خاص بالسطاف والأونر)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    تفعيل أو إيقاف الذكاء بالكامل أو حصره في روم شات محدد لمنع الإزعاج.
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${config.aiEnabled !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                  {config.aiEnabled !== false ? 'مفعل' : 'معطل'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const nextState = config.aiEnabled === false ? true : false;
                    try {
                      const res = await fetch('/api/ai/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ enabled: nextState }),
                      });
                      const d = await res.json();
                      if (d.success) {
                        alert(nextState ? '✅ تم تفعيل الذكاء الاصطناعي في السيرفر!' : '🛑 تم إيقاف الذكاء الاصطناعي في السيرفر!');
                        window.location.reload();
                      }
                    } catch (e: any) {
                      alert('خطأ: ' + e.message);
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer ${
                    config.aiEnabled !== false
                      ? 'bg-red-600/80 hover:bg-red-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {config.aiEnabled !== false ? 'إيقاف الذكاء الاصطناعي 🛑' : 'تشغيل الذكاء الاصطناعي ✅'}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const ch = prompt('أدخل ID قناة الشات التي تريد حصر الذكاء فيها (أو اتركه فارغاً للسماح في كل القنوات):', config.allowedAiChannelId || '');
                    if (ch === null) return;
                    try {
                      const res = await fetch('/api/ai/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channelId: ch.trim() || null }),
                      });
                      const d = await res.json();
                      if (d.success) {
                        alert(d.allowedAiChannelId ? `✅ تم حصر الذكاء في القناة: ${d.allowedAiChannelId}` : '✅ تم السماح بالذكاء في جميع القنوات');
                        window.location.reload();
                      }
                    } catch (e: any) {
                      alert('خطأ: ' + e.message);
                    }
                  }}
                  className="text-xs bg-[#2b2d31] hover:bg-[#35373c] text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded transition cursor-pointer font-medium"
                >
                  {config.allowedAiChannelId ? `محصور في (${config.allowedAiChannelId}) • تعديل` : 'تحديد روم مخصص للذكاء 🎯'}
                </button>
              </div>

              <div className="bg-[#111214] p-2 rounded border border-zinc-800 text-[11px] text-zinc-400">
                💬 <strong>أوامر الشات للسطاف أيضاً:</strong>
                <div className="mt-1 font-mono text-[10px] text-emerald-300 space-y-0.5">
                  <div>• <code>!aichannel set #channel</code> (حصر الذكاء في هذه القناة)</div>
                  <div>• <code>!aichannel all</code> (تشغيله في كل الرومات)</div>
                  <div>• <code>!aichannel off</code> (إيقاف الذكاء مؤقتاً)</div>
                </div>
              </div>
            </div>

            {/* Bot Token Direct Connection */}
            <div className="bg-[#2b2d31] p-3 rounded-lg border border-cyan-500/30 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                🔑 ربط توكن البوت المباشر (Discord Bot Token)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  id="discord-token-input"
                  placeholder="ضع توكن البوت هنا للاتصال المباشر..."
                  className="flex-1 bg-[#1e1f22] border border-[#232428] focus:border-cyan-400 rounded px-3 py-2 text-white font-mono text-xs outline-none"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.currentTarget;
                      const val = target.value.trim();
                      if (!val) return;
                      try {
                        const res = await fetch('/api/bot/connect', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token: val }),
                        });
                        const data = await res.json();
                        alert(data.message || 'تم إرسال التوكن بنجاح! جاري الاتصال.');
                      } catch (err: any) {
                        alert('حدث خطأ: ' + err.message);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const input = document.getElementById('discord-token-input') as HTMLInputElement;
                    const val = input?.value.trim();
                    if (!val) {
                      alert('يرجى كتابة أو لصق التوكن أولاً');
                      return;
                    }
                    try {
                      const res = await fetch('/api/bot/connect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: val }),
                      });
                      const data = await res.json();
                      alert(data.message || 'تم إرسال التوكن بنجاح! جاري الاتصال.');
                    } catch (err: any) {
                      alert('حدث خطأ: ' + err.message);
                    }
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-2 text-xs rounded transition-colors cursor-pointer"
                >
                  اتصال الآن
                </button>
              </div>
              <p className="text-[11px] text-[#949ba4]">
                يمكنك أيضاً وضع <code className="text-cyan-300">DISCORD_BOT_TOKEN</code> في ملف <code className="text-cyan-300">.env</code>.
              </p>
            </div>

            {/* Supported Discord Commands List */}
            <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#383a40] space-y-2">
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>⚡ أوامر البوت الجاهزة في الديسكورد:</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#dbdee1]">
                <div className="flex items-start gap-2 bg-[#2b2d31]/70 p-2 rounded border border-[#35373c]">
                  <code className="text-emerald-400 font-mono font-bold shrink-0">setup</code>
                  <span className="text-[11px]">
                    ينشئ كاتيجوري <strong>tempvoice category</strong> وقناة <strong>⚫️-interface</strong> وروم <strong>⚫️ tap to create</strong> مع إرسال بانل الـ 15 زراً تلقائياً.
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-[#2b2d31]/70 p-2 rounded border border-[#35373c]">
                  <code className="text-cyan-400 font-mono font-bold shrink-0">?stay</code>
                  <span className="text-[11px]">
                    يثبت البوت داخل الروم الصوتي الحالي ليبقى متواجداً <strong>24/7</strong> دون انقطاع (اكتب <code>?leave</code> لإخراجه).
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-[#2b2d31]/70 p-2 rounded border border-[#35373c]">
                  <code className="text-amber-400 font-mono font-bold shrink-0">!9ol [رسالة]</code>
                  <span className="text-[11px]">
                    أمر التحدث: يمسح رسالتك ويرسل محتواها باسم البوت (يدعم المنشن مثل <code>!9ol #شات مرحباً</code>).
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-[#2b2d31]/70 p-2 rounded border border-[#35373c]">
                  <code className="text-purple-400 font-mono font-bold shrink-0">⚫️ tap to create</code>
                  <span className="text-[11px]">
                    بمجرد دخول أي عضو لهذا الروم، ينشئ له روم صوتي خاص به وينقله إليه فورياً مع إرسال لوحة التحكم الـ 15 زراً!
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-[#232428]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#949ba4] hover:text-white transition-colors cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-semibold rounded transition-colors cursor-pointer"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
