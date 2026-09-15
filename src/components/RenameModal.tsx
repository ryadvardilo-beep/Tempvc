import React, { useState } from 'react';
import { X, Edit3 } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSubmit: (newName: string) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  currentName,
  onClose,
  onSubmit,
}) => {
  const [nameInput, setNameInput] = useState(currentName.replace(/^🔊\s*/, ''));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSubmit(nameInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div id="rename-modal-dialog" className="bg-[#313338] w-full max-w-md rounded-lg shadow-2xl border border-[#232428] overflow-hidden text-[#dbdee1] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#232428] bg-[#2b2d31]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#5865f2]" />
            <h3 className="font-bold text-white text-base">تغيير اسم روم الصوت</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#949ba4] hover:text-white p-1 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
              اسم الروم الجديد <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="rename-channel-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="اكتب الاسم هنا..."
              maxLength={50}
              required
              autoFocus
              className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded px-3.5 py-2.5 text-white placeholder-[#80848e] text-sm outline-none transition-colors"
            />
            <div className="flex justify-between items-center mt-1 text-xs text-[#949ba4]">
              <span>مثال: 🔊 Chill Lounge</span>
              <span>{nameInput.length}/50</span>
            </div>
          </div>

          <div className="bg-[#2b2d31] -mx-5 -mb-5 px-5 py-3.5 mt-6 flex justify-end gap-3 border-t border-[#232428]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white hover:underline cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors cursor-pointer shadow-sm"
            >
              حفظ وتغيير
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
