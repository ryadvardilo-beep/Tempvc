import React, { useState, useEffect } from 'react';
import { Terminal, Search, ShieldCheck, Sparkles, BookOpen, Volume2, Gamepad2, Wrench } from 'lucide-react';

interface CommandItem {
  name: string;
  description: string;
  category: 'ai' | 'voice' | 'islamic' | 'fun' | 'utility' | 'moderation';
  options?: any[];
}

interface CommandsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandsListModal({ isOpen, onClose }: CommandsListModalProps) {
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/commands')
      .then((res) => res.json())
      .then((data) => {
        if (data.commands) setCommands(data.commands);
      })
      .catch((err) => console.error('Failed to load commands:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'الكل (50+)', icon: Terminal },
    { id: 'ai', label: 'الذكاء الجزائري', icon: Sparkles },
    { id: 'islamic', label: 'إسلاميات', icon: BookOpen },
    { id: 'voice', label: 'الرومات الصوتية', icon: Volume2 },
    { id: 'utility', label: 'أدوات السيرفر', icon: Wrench },
    { id: 'fun', label: 'ألعاب وترفيه', icon: Gamepad2 },
    { id: 'moderation', label: 'إدارة وإشراف', icon: ShieldCheck },
  ];

  const filtered = commands.filter((cmd) => {
    const matchesCat = filterCategory === 'all' || cmd.category === filterCategory;
    const matchesSearch =
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(`/${name}`);
    setCopiedCmd(name);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18191c] border border-cyan-500/30 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col h-[680px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-[#1e1f22] to-blue-950/60 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base">دليل أوامر البوت الكاملة (50+ أمر)</h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Slash / & Prefix !
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                تصفح جميع الأوامر المتاحة واستخدمها مباشرة في سيرفرك بالسلاش (/) أو البادئة (!)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Filter bar & Search */}
        <div className="p-4 bg-[#141517] border-b border-zinc-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أمر أو وظيفة..."
              className="w-full bg-[#1e1f22] text-white text-sm pr-9 pl-4 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {categories.map((c) => {
              const Icon = c.icon;
              const isActive = filterCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    isActive
                      ? 'bg-cyan-500 text-black font-semibold shadow-lg shadow-cyan-500/20'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Command list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#111214]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              لا توجد أوامر مطابقة لعملية البحث.
            </div>
          ) : (
            filtered.map((cmd) => (
              <div
                key={cmd.name}
                className="p-3 bg-[#1e1f22] hover:bg-[#25272b] border border-zinc-800 hover:border-zinc-700 rounded-xl transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold text-sm">/{cmd.name}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">أو !{cmd.name}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        cmd.category === 'ai'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : cmd.category === 'islamic'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : cmd.category === 'voice'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {cmd.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-normal">{cmd.description}</p>
                </div>

                <button
                  onClick={() => handleCopy(cmd.name)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-cyan-600 hover:text-black text-zinc-300 rounded-lg text-xs transition font-mono shrink-0 mr-2"
                >
                  {copiedCmd === cmd.name ? '✓ تم النسخ' : 'نسخ الأمر'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#18191c] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>إجمالي الأوامر: **{commands.length} أمر** مسجل وجاهز</span>
          <span className="text-emerald-400 font-medium">● تعمل 24/7 سحابياً</span>
        </div>
      </div>
    </div>
  );
}
