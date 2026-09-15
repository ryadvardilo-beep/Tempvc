import React from 'react';
import { X, FileText, Lock, Users, Shield, Clock, Sliders } from 'lucide-react';
import { TempVoiceChannel } from '../types';

interface InfoModalProps {
  isOpen: boolean;
  channel: TempVoiceChannel;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  channel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div id="info-modal-dialog" className="bg-[#313338] w-full max-w-md rounded-lg shadow-2xl border border-[#232428] overflow-hidden text-[#dbdee1] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-[#232428] bg-[#2b2d31]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#5865f2]" />
            <h3 className="font-bold text-white text-base">📜 إحصائيات ومعلومات الروم</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#949ba4] hover:text-white p-1 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#2b2d31]">
            <div className="text-xs text-[#949ba4] mb-1">اسم الروم الصوتي:</div>
            <div className="text-base font-bold text-white">{channel.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#1e1f22] p-2.5 rounded-lg border border-[#2b2d31]">
              <div className="text-[11px] text-[#949ba4] flex items-center gap-1 mb-1">
                <Shield className="w-3.5 h-3.5 text-[#f0b232]" />
                <span>المالك الحالي</span>
              </div>
              <div className="text-xs font-bold text-white">{channel.ownerName}</div>
            </div>

            <div className="bg-[#1e1f22] p-2.5 rounded-lg border border-[#2b2d31]">
              <div className="text-[11px] text-[#949ba4] flex items-center gap-1 mb-1">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>السعة القصوى</span>
              </div>
              <div className="text-xs font-bold text-white">
                {channel.userLimit === 0 ? 'غير محدود (∞)' : `${channel.userLimit} أعضاء`}
              </div>
            </div>

            <div className="bg-[#1e1f22] p-2.5 rounded-lg border border-[#2b2d31]">
              <div className="text-[11px] text-[#949ba4] flex items-center gap-1 mb-1">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>حالة الخصوصية</span>
              </div>
              <div className="text-xs font-bold text-white">
                {channel.isLocked ? '🔒 مقفل' : '🔓 مفتوح للجميع'}
              </div>
            </div>

            <div className="bg-[#1e1f22] p-2.5 rounded-lg border border-[#2b2d31]">
              <div className="text-[11px] text-[#949ba4] flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>المتواجدون الآن</span>
              </div>
              <div className="text-xs font-bold text-white">
                {channel.members.length} عضو
              </div>
            </div>
          </div>

          <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#2b2d31] space-y-1 text-xs">
            <div className="flex justify-between text-[#949ba4]">
              <span>الأعضاء الموثوقون (Trust):</span>
              <strong className="text-white">{channel.trustedUserIds.length}</strong>
            </div>
            <div className="flex justify-between text-[#949ba4]">
              <span>المحظورون (Block):</span>
              <strong className="text-rose-400">{channel.blockedUserIds.length}</strong>
            </div>
            <div className="flex justify-between text-[#949ba4] pt-1 border-t border-[#2b2d31]">
              <span>تاريخ الإنشاء:</span>
              <span className="font-mono text-[#dbdee1]">{new Date(channel.createdAt).toLocaleTimeString('ar-EG')}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end border-t border-[#232428]">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
