import React, { useState } from 'react';
import { Terminal, ShieldAlert, Sparkles, Filter, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { BotLog, StaffAlert } from '../types';

interface AuditLogProps {
  logs: BotLog[];
  staffAlerts: StaffAlert[];
  onClearLogs?: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs, staffAlerts, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'voice' | 'staff' | 'permissions'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'voice') return log.type === 'voice_create' || log.type === 'voice_delete';
    if (filter === 'staff') return log.type === 'staff_alert';
    if (filter === 'permissions') return log.type === 'permission' || log.type === 'rename';
    return true;
  });

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'voice_create':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-mono">CREATE</span>;
      case 'voice_delete':
        return <span className="bg-rose-950 text-rose-400 border border-rose-800 text-[10px] px-1.5 py-0.5 rounded font-mono">DELETE</span>;
      case 'permission':
        return <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] px-1.5 py-0.5 rounded font-mono">PERMS</span>;
      case 'rename':
        return <span className="bg-purple-950 text-purple-400 border border-purple-800 text-[10px] px-1.5 py-0.5 rounded font-mono">RENAME</span>;
      case 'staff_alert':
        return <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] px-1.5 py-0.5 rounded font-mono">ALERT</span>;
      default:
        return <span className="bg-[#1e1f22] text-[#949ba4] border border-[#383a40] text-[10px] px-1.5 py-0.5 rounded font-mono">INFO</span>;
    }
  };

  return (
    <div id="bot-audit-log-panel" className="bg-[#2b2d31] rounded-lg border border-[#232428] flex flex-col h-full shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-[#232428] bg-[#313338] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#5865f2]" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">سجل أحداث البوت (Event Console)</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#1e1f22] p-0.5 rounded text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded cursor-pointer ${filter === 'all' ? 'bg-[#5865f2] text-white font-medium' : 'text-[#949ba4]'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter('voice')}
              className={`px-2 py-0.5 rounded cursor-pointer ${filter === 'voice' ? 'bg-[#5865f2] text-white font-medium' : 'text-[#949ba4]'}`}
            >
              الرومات
            </button>
            <button
              onClick={() => setFilter('staff')}
              className={`px-2 py-0.5 rounded cursor-pointer ${filter === 'staff' ? 'bg-[#5865f2] text-white font-medium' : 'text-[#949ba4]'}`}
            >
              النداءات
            </button>
          </div>
        </div>
      </div>

      {/* Staff Alerts Banner if any */}
      {staffAlerts.length > 0 && (
        <div className="bg-amber-950/40 border-b border-amber-900/60 p-2.5 px-3.5">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>آخر نداء إدارة عاجل:</span>
          </div>
          <div className="text-xs text-amber-200/90 font-mono bg-[#1e1f22]/70 p-2 rounded border border-amber-900/40">
            🚨 <span className="font-bold">@{staffAlerts[0].requesterName}</span> طلب المشرفين في{' '}
            <span className="text-white">{staffAlerts[0].channelName}</span>: {staffAlerts[0].rolesMentioned.map((r) => `<@&${r}>`).join(' ')}
          </div>
        </div>
      )}

      {/* Event Logs List */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-[#949ba4] text-xs">
            لا توجد أحداث مسجلة في هذا التصنيف.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 p-2 rounded bg-[#1e1f22]/60 hover:bg-[#1e1f22] border border-[#2b2d31] transition-colors"
            >
              <span className="text-[#80848e] shrink-0 text-[11px]">{log.timestamp}</span>
              <div className="shrink-0">{getLogBadge(log.type)}</div>
              <div className="text-[#dbdee1] flex-1 leading-relaxed break-all">
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
