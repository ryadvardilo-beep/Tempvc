import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, MessageSquare, Check, Terminal } from 'lucide-react';

interface AlgerianAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export function AlgerianAiModal({ isOpen, onClose, userName }: AlgerianAiModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `السلام عليكم ورحمة الله وبركاته يا خويا ${userName}! واش راك لاباس؟ الحمد لله. راني هنا خوك في الخدمة، سقسيني على أي عفسة تحبها بالدارجة الجزائرية: دين، ثقافة، نصيحة، أو أمور السيرفر والرومات!`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text, userName }),
      });

      const data = await res.json();
      const botReply = data.reply || 'يعطيك الصحة خويا، ما وصلتش الإجابة مليح عاودلي برك!';

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: `يا خويا كاين انقطاع في الاتصال بالذكاء الاصطناعي (${err.message})، تأكد برك من ضبط مفتاح GEMINI_API_KEY.`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'واش تنصحني اليوم يا خويا؟',
    'أعطيني مثل جزائري قديم وحكمته',
    'فكرني بفضل الصلاة على النبي ﷺ',
    'كيفاش ندير setup لرومات البوت؟',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18191c] border border-emerald-500/30 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[640px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/70 via-[#1e1f22] to-teal-950/70 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base">الذكاء الاصطناعي الجزائري</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Gemini 3.8 Flash • دارجة ومثقف
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                تحدث مع البوت كإنسان حقيقي بالدارجة الجزائرية الأصيلة مع طابع إسلامي راقي
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

        {/* Discord Tagging Info banner */}
        <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-2 flex items-center gap-2 text-xs text-emerald-200">
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            💡 **في سيرفر الديسكورد:** فقط طاقي البوت <span className="font-mono bg-black/40 px-1 rounded">@البوت</span> واكتب رسالتك مباشرة، راح يجاوبك فوراً بالدارجة!
          </span>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111214]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : '🇩🇿'}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#2b2d31] text-zinc-100 border border-zinc-700/50 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 opacity-60 text-right ${
                    m.sender === 'user' ? 'text-blue-100' : 'text-zinc-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs text-white shrink-0">
                🇩🇿
              </div>
              <div className="bg-[#2b2d31] rounded-2xl rounded-tl-none px-4 py-3 text-sm text-zinc-300 flex items-center gap-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-150">●</span>
                <span className="animate-bounce delay-300">●</span>
                <span className="text-xs text-zinc-400 mr-1">راهو يخمم ويكتبلك بالدارجة...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-[#18191c] border-t border-zinc-800 flex gap-2 overflow-x-auto text-xs no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(qp)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg whitespace-nowrap transition border border-zinc-700/50 text-[11px]"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#1e1f22] border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="اكتب رسالتك بالدارجة أو اسأله في الدين والثقافة..."
            className="flex-1 bg-[#111214] text-white text-sm px-4 py-2.5 rounded-xl border border-zinc-700/70 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
