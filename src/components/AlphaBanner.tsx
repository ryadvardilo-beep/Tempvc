import React from 'react';
import { Shield, Lock, Unlock, Users, Ban, Edit3, Sliders, PhoneCall, ShieldAlert } from 'lucide-react';

export const AlphaBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1022] via-[#091530] to-[#120a28] border border-[#00e5ff]/30 shadow-2xl p-5 select-none my-3">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff0d_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff0d_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Ambient Glows */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Bar */}
      <div className="relative flex items-center justify-between z-10 mb-4 pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black shadow-lg shadow-cyan-500/40 text-xs tracking-tighter border border-cyan-300">
            SEK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 font-black text-base sm:text-lg tracking-wider font-mono">
                SEK BOT
              </span>
              <span className="hidden sm:inline-block bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                ● ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase">
              PREMIUM DISCORD BOT SERVICES
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-cyan-300/80 font-mono bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
            v1.5 // SECURE SYSTEM
          </span>
        </div>
      </div>

      {/* Hexagonal / Cyber Badges Display matching image */}
      <div className="relative z-10 grid grid-cols-4 sm:grid-cols-8 gap-2 my-3">
        {[
          { label: 'LOCK', icon: <Lock className="w-4 h-4 text-cyan-400" /> },
          { label: 'UNLOCK', icon: <Unlock className="w-4 h-4 text-cyan-400" /> },
          { label: 'TRUST', icon: <Users className="w-4 h-4 text-cyan-400" /> },
          { label: 'BLOCK', icon: <Ban className="w-4 h-4 text-rose-400" /> },
          { label: 'RENAME', icon: <Edit3 className="w-4 h-4 text-cyan-400" /> },
          { label: 'LIMIT', icon: <Sliders className="w-4 h-4 text-cyan-400" /> },
          { label: 'KICK', icon: <PhoneCall className="w-4 h-4 text-cyan-400" /> },
          { label: 'ADMIN', icon: <ShieldAlert className="w-4 h-4 text-purple-400" /> },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#071328]/80 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm hover:shadow-cyan-500/20 group"
          >
            <div className="p-1 rounded-md bg-cyan-950/40 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span className="text-[9px] font-mono font-bold text-cyan-300 mt-1 tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between text-[11px] text-[#949ba4] font-mono pt-1">
        <span className="text-cyan-400/90 font-semibold">
          SEK System
        </span>
        <span className="hidden md:inline text-xs text-[#80848e]">Yesterday at 3:51 AM</span>
      </div>
    </div>
  );
};
