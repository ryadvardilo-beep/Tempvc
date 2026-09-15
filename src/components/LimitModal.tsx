import React, { useState } from 'react';
import { X, Sliders } from 'lucide-react';

interface LimitModalProps {
  isOpen: boolean;
  currentLimit: number;
  onClose: () => void;
  onSubmit: (limit: number) => void;
}

export const LimitModal: React.FC<LimitModalProps> = ({
  isOpen,
  currentLimit,
  onClose,
  onSubmit,
}) => {
  const [val, setVal] = useState<string>(currentLimit.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 99) {
      onSubmit(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div id="limit-modal-dialog" className="bg-[#313338] w-full max-w-sm rounded-lg shadow-2xl border border-[#232428] overflow-hidden text-[#dbdee1] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-[#232428] bg-[#2b2d31]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">🔢 تحديد سعة الروم الصوتي</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#949ba4] hover:text-white p-1 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-1.5">
              عدد الأعضاء الأقصى (1 - 99 أو 0 لعدد غير محدود):
            </label>
            <input
              type="number"
              min="0"
              max="99"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              required
              className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded px-3 py-2 text-white font-mono text-sm outline-none"
            />
            <p className="text-[11px] text-[#949ba4] mt-1.5">
              القيمة <code className="text-[#5865f2] bg-[#1e1f22] px-1 py-0.5 rounded">0</code> تعني سعة غير محدودة (∞).
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2.5 border-t border-[#232428]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#949ba4] hover:text-white transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded transition-colors cursor-pointer"
            >
              حفظ السعة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
