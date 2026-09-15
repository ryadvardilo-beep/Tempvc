import React, { useState } from 'react';
import { X, UserCheck, Ban, UserX, PhoneCall, RefreshCw, Users } from 'lucide-react';
import { VoiceMember } from '../types';

interface MemberSelectModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionType: 'trust' | 'untrust' | 'block' | 'unblock' | 'kick' | 'pass_leader';
  members: VoiceMember[];
  trustedIds?: string[];
  blockedIds?: string[];
  currentUserId: string;
  onClose: () => void;
  onConfirm: (targetUserId: string) => void;
}

export const MemberSelectModal: React.FC<MemberSelectModalProps> = ({
  isOpen,
  title,
  description,
  actionType,
  members,
  trustedIds = [],
  blockedIds = [],
  currentUserId,
  onClose,
  onConfirm,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');

  if (!isOpen) return null;

  // Filter candidates depending on actionType
  let candidateList = [...members];
  if (actionType === 'kick' || actionType === 'pass_leader') {
    candidateList = candidateList.filter((m) => m.id !== currentUserId);
  }

  const handleConfirm = () => {
    const finalId = selectedId || manualInput.trim();
    if (finalId) {
      onConfirm(finalId);
      onClose();
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'trust':
        return <UserCheck className="w-5 h-5 text-cyan-400" />;
      case 'untrust':
        return <UserX className="w-5 h-5 text-amber-400" />;
      case 'block':
        return <Ban className="w-5 h-5 text-rose-400" />;
      case 'unblock':
        return <UserCheck className="w-5 h-5 text-emerald-400" />;
      case 'kick':
        return <PhoneCall className="w-5 h-5 text-rose-400" />;
      case 'pass_leader':
        return <RefreshCw className="w-5 h-5 text-[#f0b232]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div id="member-select-dialog" className="bg-[#313338] w-full max-w-md rounded-lg shadow-2xl border border-[#232428] overflow-hidden text-[#dbdee1] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-[#232428] bg-[#2b2d31]">
          <div className="flex items-center gap-2">
            {getActionIcon()}
            <h3 className="font-bold text-white text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#949ba4] hover:text-white p-1 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-[#b5bac1] leading-relaxed">{description}</p>

          {/* Members in current room */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#949ba4] mb-2">
              اختر عضواً من المتواجدين بالروم:
            </label>
            {candidateList.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#80848e] bg-[#1e1f22] rounded border border-[#2b2d31]">
                لا يوجد أعضاء آخرون داخل الروم حالياً. يمكنك إدخال Discord User ID أدناه.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {candidateList.map((m) => {
                  const isSelected = selectedId === m.id;
                  const isTrusted = trustedIds.includes(m.id);
                  const isBlocked = blockedIds.includes(m.id);

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedId(m.id);
                        setManualInput('');
                      }}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#5865f2] text-white'
                          : 'bg-[#1e1f22] hover:bg-[#35373c] text-[#dbdee1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-xs font-semibold">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {isTrusted && <span className="bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded">Trusted</span>}
                        {isBlocked && <span className="bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded">Blocked</span>}
                        <span className="font-mono text-[10px] opacity-70">#{m.id.slice(-4)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Manual ID Input */}
          <div className="pt-2 border-t border-[#2b2d31]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#949ba4] mb-1.5">
              أو اكتب Discord User ID يدوياً:
            </label>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value);
                setSelectedId('');
              }}
              placeholder="مثال: 1054739108905361469"
              className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded px-3 py-2 text-white font-mono text-xs outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#232428]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#949ba4] hover:text-white transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedId && !manualInput.trim()}
              className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-xs font-bold rounded transition-colors cursor-pointer"
            >
              تأكيد الإجراء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
