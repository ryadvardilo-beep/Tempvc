import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { VoiceRoomView } from './components/VoiceRoomView';
import { InterfaceChannelView } from './components/InterfaceChannelView';
import { AuditLog } from './components/AuditLog';
import { RenameModal } from './components/RenameModal';
import { LimitModal } from './components/LimitModal';
import { InfoModal } from './components/InfoModal';
import { XOGameModal } from './components/XOGameModal';
import { MemberSelectModal } from './components/MemberSelectModal';
import { ConfigModal } from './components/ConfigModal';
import { AlgerianAiModal } from './components/AlgerianAiModal';
import { CommandsListModal } from './components/CommandsListModal';
import { TempVoiceChannel, VoiceMember, BotConfig, BotLog, StaffAlert } from './types';
import { Sparkles, Terminal, Volume2, ShieldCheck, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

const mockUsers: VoiceMember[] = [
  {
    id: '1054739108905361469',
    name: 'Ahmed (Owner)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    isOwner: true,
    isAdmin: false,
    isSpeaking: false,
    joinedAt: Date.now(),
  },
  {
    id: 'usr-admin-777',
    name: 'Sarah (Admin)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    isOwner: false,
    isAdmin: true,
    isSpeaking: false,
    joinedAt: Date.now(),
  },
  {
    id: 'usr-regular-888',
    name: 'Zaid (Guest Member)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    isOwner: false,
    isAdmin: false,
    isSpeaking: false,
    joinedAt: Date.now(),
  },
];

export default function App() {
  const [channels, setChannels] = useState<TempVoiceChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'interface' | 'voice'>('interface');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [staffAlerts, setStaffAlerts] = useState<StaffAlert[]>([]);
  
  // Modals state
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isXOGameOpen, setIsXOGameOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCommandsModalOpen, setIsCommandsModalOpen] = useState(false);
  
  // Member Select Modal state
  const [memberSelectConfig, setMemberSelectConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'trust' | 'untrust' | 'block' | 'unblock' | 'kick' | 'pass_leader';
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'trust',
  });

  const [ephemeralToast, setEphemeralToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showConsole, setShowConsole] = useState(true);

  const [config, setConfig] = useState<BotConfig>({
    name: 'SEK Temp-VC',
    avatar: 'https://i.imgur.com/bvh29zT.png',
    botUserId: '1548852512965140541',
    ownerUserId: '1054739108905361469',
    createVcId: '1054739108905361469',
    highStaffRoleIds: ['1054739108905361469', '1548474673124081795'],
    isTokenConfigured: false,
    isLiveBotConnected: false,
    botTag: 'Tempvoice#0001',
    pingMs: 22,
  });

  const currentUser = mockUsers[currentUserIndex];

  const showToast = (message: string, isError = false) => {
    setEphemeralToast({ message, isError });
    setTimeout(() => {
      setEphemeralToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data.activeTempVCs || []);
        if (data.activeTempVCs?.length > 0 && !activeChannelId) {
          setActiveChannelId(data.activeTempVCs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch channels:', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig((prev) => ({ ...prev, ...data.config }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStaffAlerts(data.staffAlerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchStatus();
    fetchLogs();

    const interval = setInterval(() => {
      fetchChannels();
      fetchLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinTapToCreate = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/channels/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: config.createVcId,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            isAdmin: currentUser.isAdmin,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'تم إنشاء غرفتك الصوتية ونقلك إليها بنجاح!');
        await fetchChannels();
        await fetchLogs();
        if (data.channel?.id) {
          setActiveChannelId(data.channel.id);
          setCurrentView('voice');
        }
      } else {
        showToast(data.error || 'حدث خطأ أثناء الإنشاء', true);
      }
    } catch (err: any) {
      showToast('فشل الاتصال بالخادم', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeaveCurrentChannel = async () => {
    const targetChannelId = activeChannelId || (channels.length > 0 ? channels[0].id : null);
    if (!targetChannelId) return;

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/channels/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: targetChannelId,
          userId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.deleted ? 'تم حذف الروم الصوتي لخلوه من الأعضاء' : 'لقد غادرت الروم الصوتي');
        await fetchChannels();
        await fetchLogs();
        if (data.deleted) {
          setActiveChannelId(null);
          setCurrentView('interface');
        }
      }
    } catch (err) {
      showToast('فشل مغادرة الروم', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  // The 15 Buttons Action Handler
  const handleControlAction = async (action: string) => {
    const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
    const targetChannelId = currentChannel?.id;

    if (!targetChannelId) {
      showToast('يرجى إنشاء أو الانضمام إلى روم صوتي أولاً لتنفيذ الأوامر', true);
      return;
    }

    // Modal Trigger Actions
    if (action === 'rename') {
      setIsRenameOpen(true);
      return;
    }

    if (action === 'limit') {
      setIsLimitOpen(true);
      return;
    }

    if (action === 'info') {
      setIsInfoOpen(true);
      return;
    }

    if (action === 'xo_game') {
      setIsXOGameOpen(true);
      return;
    }

    if (action === 'trust') {
      setMemberSelectConfig({
        isOpen: true,
        title: '👥 منح تصريح لعضو (Trust)',
        description: 'اختر العضو الذي ترغب بالسماح له بدخول الروم الصوتي حتى في حال كان مقفلاً (Locked).',
        actionType: 'trust',
      });
      return;
    }

    if (action === 'untrust') {
      setMemberSelectConfig({
        isOpen: true,
        title: '👤 إلغاء تصريح عضو (Untrust)',
        description: 'اختر العضو الذي ترغب بإلغاء تصريح الدخول الخاص به وإعادته كعضو عادي.',
        actionType: 'untrust',
      });
      return;
    }

    if (action === 'block') {
      setMemberSelectConfig({
        isOpen: true,
        title: '🚫 طرد وحظر عضو (Block)',
        description: 'اختر العضو لحظره وطرده فوراً من الروم ومنعه من الدخول إليه نهائياً.',
        actionType: 'block',
      });
      return;
    }

    if (action === 'unblock') {
      setMemberSelectConfig({
        isOpen: true,
        title: '⭕ إلغاء حظر عضو (Unblock)',
        description: 'اختر العضو لفك الحظر عنه والسماح له بالانضمام للروم مجدداً.',
        actionType: 'unblock',
      });
      return;
    }

    if (action === 'kick') {
      setMemberSelectConfig({
        isOpen: true,
        title: '📞 طرد عضو من الروم (Kick)',
        description: 'اختر العضو الذي تريد طرده من الروم الصوتي حالياً.',
        actionType: 'kick',
      });
      return;
    }

    if (action === 'admin') {
      const isOwner = currentUser.id === currentChannel.ownerId || currentUser.isAdmin;
      if (isOwner) {
        setMemberSelectConfig({
          isOpen: true,
          title: '👑 إدارة ملكية الروم (ADMIN - Pass Leader)',
          description: 'اختر العضو الذي تريد تحويل ملكية الروم الصوتي إليه.',
          actionType: 'pass_leader',
        });
        return;
      } else {
        action = 'claim';
      }
    }

    if (action === 'pass_leader') {
      setMemberSelectConfig({
        isOpen: true,
        title: '🔄 نقل ملكية الروم (Pass Leader)',
        description: 'اختر العضو الذي تريد تحويل ملكية الروم الصوتي بالكامل إليه.',
        actionType: 'pass_leader',
      });
      return;
    }

    // Direct Actions: lock, unlock, invite, claim, staff_help
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/channels/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: targetChannelId,
          action,
          userId: currentUser.id,
          isAdmin: currentUser.isAdmin,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'تم تنفيذ العملية بنجاح');
        await fetchChannels();
        await fetchLogs();
      } else {
        showToast(data.error || 'ليس لديك صلاحية لتنفيذ هذا الأمر', true);
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالخادم', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Member Action Submission Handler (for trust, untrust, block, unblock, kick, pass_leader)
  const handleMemberActionConfirm = async (targetUserId: string) => {
    const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
    if (!currentChannel) return;

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/channels/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: currentChannel.id,
          action: memberSelectConfig.actionType,
          targetUserId,
          userId: currentUser.id,
          isAdmin: currentUser.isAdmin,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'تم تنفيذ الإجراء بنجاح');
        await fetchChannels();
        await fetchLogs();
      } else {
        showToast(data.error || 'فشل تنفيذ الإجراء', true);
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Rename Submission Handler
  const handleRenameSubmit = async (newName: string) => {
    const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
    if (!currentChannel) return;

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/channels/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: currentChannel.id,
          action: 'rename',
          newName,
          userId: currentUser.id,
          isAdmin: currentUser.isAdmin,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تم تغيير الاسم إلى ${newName}`);
        await fetchChannels();
        await fetchLogs();
      } else {
        showToast(data.error || 'فشل تغيير الاسم', true);
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Limit Submission Handler
  const handleLimitSubmit = async (limitValue: number) => {
    const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
    if (!currentChannel) return;

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/channels/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: currentChannel.id,
          action: 'limit',
          limitValue,
          userId: currentUser.id,
          isAdmin: currentUser.isAdmin,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تم تحديد السعة إلى ${limitValue}`);
        await fetchChannels();
        await fetchLogs();
      } else {
        showToast(data.error || 'فشل تحديد السعة', true);
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddGuestMember = async () => {
    const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
    if (!currentChannel) return;

    const names = ['Karim', 'Layla', 'Tariq', 'Nour', 'Omar', 'Youssef'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const guestId = `usr-guest-${Math.floor(Math.random() * 9000 + 1000)}`;

    try {
      const res = await fetch('/api/channels/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: currentChannel.id,
          user: {
            id: guestId,
            name: randomName,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomName}`,
            isAdmin: false,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`انضم ${randomName} إلى الروم!`);
        await fetchChannels();
        await fetchLogs();
      } else {
        showToast(data.error || 'تعذر إضافة العضو', true);
      }
    } catch (err) {
      showToast('حدث خطأ', true);
    }
  };

  const handleToggleSpeaking = () => {
    currentUser.isSpeaking = !currentUser.isSpeaking;
    setChannels([...channels]);
  };

  const handleToggleUserRole = () => {
    const nextIndex = (currentUserIndex + 1) % mockUsers.length;
    setCurrentUserIndex(nextIndex);
    const nextUser = mockUsers[nextIndex];
    showToast(
      `تم التبديل إلى: ${nextUser.name} (${nextUser.isAdmin ? 'مشرف سيرفر' : nextUser.isOwner ? 'مالك الروم' : 'عضو عادي'})`
    );
  };

  const handleSaveConfig = async (updated: { createVcId: string; ownerUserId: string; highStaffRoleIds: string[] }) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) => ({ ...prev, ...data.config }));
        showToast('✅ تم حفظ إعدادات البوت والـ IDs بنجاح');
        await fetchLogs();
      }
    } catch (err) {
      showToast('فشل حفظ الإعدادات', true);
    }
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1f22] text-[#dbdee1] font-sans antialiased">
      {/* Top Banner / Global Bot Bar */}
      <header className="h-11 bg-[#1e1f22] border-b border-[#2b2d31] px-4 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <img src={config.avatar} alt="bot" className="w-5 h-5 rounded-full object-cover" />
            <span className="font-mono text-cyan-400 font-bold">SEK</span>
            <span className="hidden sm:inline text-[#949ba4]">• Temp-VC Bot (15 Buttons)</span>
            <span className="bg-[#23a55a] text-white text-[10px] font-semibold px-1.5 py-0.2 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              ONLINE
            </span>
          </div>

          <span className="text-[#80848e]">|</span>

          <div className="hidden sm:flex items-center gap-3 text-[#949ba4]">
            <span>الرومات النشطة: <strong className="text-white">{channels.length}</strong></span>
            <span>•</span>
            <span>بينج: <strong className="text-cyan-400">{config.pingMs}ms</strong></span>
            <span>•</span>
            <span>القناة: <strong className="text-white font-mono">{currentView === 'interface' ? '#⚫️interface' : activeChannel?.name || 'Voice'}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Algerian AI Chat Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            title="تحدث مع البوت كإنسان حقيقي بالدارجة الجزائرية"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>الذكاء الجزائري 🇩🇿</span>
          </button>

          {/* 50+ Commands Guide Button */}
          <button
            onClick={() => setIsCommandsModalOpen(true)}
            className="px-2.5 py-1 bg-[#2b2d31] hover:bg-[#35373c] border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 hover:text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="تصفح قائمة الأوامر الـ 50 الكاملة"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>الأوامر (50+)</span>
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showConsole ? 'bg-[#5865f2] text-white' : 'bg-[#2b2d31] text-[#949ba4] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>سجل الأحداث</span>
          </button>

          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-2.5 py-1 bg-[#2b2d31] hover:bg-[#35373c] text-white rounded text-xs font-medium transition-colors cursor-pointer"
          >
            الإعدادات والـ IDs
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Discord Channels Sidebar */}
        <Sidebar
          channels={channels}
          activeChannelId={activeChannel?.id || null}
          currentView={currentView}
          currentUser={currentUser}
          onSelectChannel={(id) => {
            setActiveChannelId(id);
            setCurrentView('voice');
          }}
          onSelectInterfaceView={() => setCurrentView('interface')}
          onJoinTapToCreate={handleJoinTapToCreate}
          onLeaveCurrentChannel={handleLeaveCurrentChannel}
          onToggleUserRole={handleToggleUserRole}
          onOpenConfig={() => setIsConfigOpen(true)}
        />

        {/* Center: Main View (either #⚫️interface guide or Voice Room view) */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#313338]">
          {currentView === 'interface' ? (
            <InterfaceChannelView
              channel={activeChannel}
              currentUser={currentUser}
              onControlAction={handleControlAction}
              isActionLoading={isActionLoading}
            />
          ) : activeChannel ? (
            <VoiceRoomView
              channel={activeChannel}
              currentUser={currentUser}
              onControlAction={handleControlAction}
              onAddGuestMember={handleAddGuestMember}
              onLeaveChannel={handleLeaveCurrentChannel}
              onToggleSpeaking={handleToggleSpeaking}
              isActionLoading={isActionLoading}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#313338]">
              <div className="w-16 h-16 rounded-full bg-[#2b2d31] border border-[#383a40] flex items-center justify-center mb-4 text-[#5865f2]">
                <Volume2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">لا يوجد روم صوتي مفتوح حالياً</h2>
              <p className="text-sm text-[#949ba4] max-w-md mb-6 leading-relaxed">
                اضغط على زر <strong className="text-white">"➕ [+] اضغط لإنشاء روم"</strong> لإنشاء غرفتك فوراً أو انتقل إلى <strong className="text-white">#⚫️interface</strong> لعرض اللوحة الكاملة والأزرار الـ 15.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleJoinTapToCreate}
                  className="px-6 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-md shadow-md transition-all active:scale-98 flex items-center gap-2 cursor-pointer"
                >
                  <span>➕ [+] اضغط لإنشاء روم</span>
                </button>
                <button
                  onClick={() => setCurrentView('interface')}
                  className="px-6 py-2.5 bg-[#2b2d31] hover:bg-[#35373c] text-white font-semibold rounded-md shadow-md transition-all cursor-pointer border border-[#383a40]"
                >
                  <span>#⚫️interface</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel: Live Event Logs (Collapsible) */}
        {showConsole && (
          <aside className="w-80 border-l border-[#1f2023] bg-[#2b2d31] hidden lg:flex flex-col h-full shrink-0">
            <AuditLog logs={logs} staffAlerts={staffAlerts} />
          </aside>
        )}
      </div>

      {/* Ephemeral Discord Toast (Bottom Center) */}
      {ephemeralToast && (
        <div
          id="discord-ephemeral-toast"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div
            className={`px-4 py-2.5 rounded-md shadow-2xl flex items-center gap-2.5 text-sm font-medium border ${
              ephemeralToast.isError
                ? 'bg-[#da373c] text-white border-[#f23f43]'
                : 'bg-[#23a55a] text-white border-[#2dc76d]'
            }`}
          >
            {ephemeralToast.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{ephemeralToast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <RenameModal
        isOpen={isRenameOpen}
        currentName={activeChannel?.name || '🔊 Voice Room'}
        onClose={() => setIsRenameOpen(false)}
        onSubmit={handleRenameSubmit}
      />

      <LimitModal
        isOpen={isLimitOpen}
        currentLimit={activeChannel?.userLimit || 10}
        onClose={() => setIsLimitOpen(false)}
        onSubmit={handleLimitSubmit}
      />

      {activeChannel && (
        <InfoModal
          isOpen={isInfoOpen}
          channel={activeChannel}
          onClose={() => setIsInfoOpen(false)}
        />
      )}

      <XOGameModal
        isOpen={isXOGameOpen}
        channelId={activeChannel?.id || 'demo'}
        userId={currentUser.id}
        onClose={() => setIsXOGameOpen(false)}
      />

      <MemberSelectModal
        isOpen={memberSelectConfig.isOpen}
        title={memberSelectConfig.title}
        description={memberSelectConfig.description}
        actionType={memberSelectConfig.actionType}
        members={activeChannel?.members || []}
        trustedIds={activeChannel?.trustedUserIds || []}
        blockedIds={activeChannel?.blockedUserIds || []}
        currentUserId={currentUser.id}
        onClose={() => setMemberSelectConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleMemberActionConfirm}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        config={config}
        onClose={() => setIsConfigOpen(false)}
        onSaveConfig={handleSaveConfig}
      />

      <AlgerianAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        userName={currentUser.name}
      />

      <CommandsListModal
        isOpen={isCommandsModalOpen}
        onClose={() => setIsCommandsModalOpen(false)}
      />
    </div>
  );
}
