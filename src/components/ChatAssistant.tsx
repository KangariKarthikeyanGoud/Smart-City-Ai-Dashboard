import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2, Cpu, Sparkles, MessageSquareCode } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  warning?: string;
}

interface ChatAssistantProps {
  currentRole: string;
}

export default function ChatAssistant({ currentRole }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `### 🏙️ Metropolis Central AI Operational

Greetings! I am Metropolis Central AI, connected directly to our municipal grids. I am here to assist you as a **${currentRole}**.

You can ask me questions about real-time telemetry like:
*   *"Which sector is experiencing the highest pollution?"*
*   *"Show me standard vs alternate traffic travel times."*
*   *"Are there any active pipeline leaks or water shortages?"*
*   *"Which areas have highest crime logs?"*`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = { id: userMsgId, role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Map frontend logs to history format for server
      const chatHistory = messages
        .filter(m => m.id !== 'init-1')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, chatHistory })
      });

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || "I didn't receive a response. Please check connections.",
        warning: data.warning
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to get chat response:', err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `### ⚠️ Central Hub Connection Outage\n\nI was unable to establish connection to the Central AI dispatch router. Please verify server endpoints are running on port 3000.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        content: `### 🏙️ Metropolis Central AI Operational\n\nDatabase telemetry re-initialized. I am ready to process queries for the **${currentRole}** operations desk.`
      }
    ]);
  };

  const quickPrompts = [
    "Which area has highest pollution?",
    "Show today's traffic alternate routes.",
    "Which sectors are safest?",
    "Predict tomorrow's traffic.",
    "Any water shortages this month?"
  ];

  return (
    <div className="bg-white dark:bg-[#1a1b26] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[520px]" id="operations_ai_chat_panel">
      
      {/* Chat header */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </div>
          <Bot className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Metropolis Central AI Ops</span>
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded dark:bg-indigo-950/30 dark:text-indigo-400 font-bold">gemini-3.5-flash</span>
        </div>

        <button 
          onClick={handleClearChat}
          title="Clear conversational logs"
          className="p-1 text-slate-400 hover:text-rose-500 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages layout */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-[#f8fafc]/50 dark:bg-[#0e0f17]/35">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Profile icon */}
              <div className={`p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-500" />}
              </div>

              {/* Message Box */}
              <div className="space-y-1">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none' : 'bg-white dark:bg-[#1a1b26] text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 rounded-tl-none'}`}>
                  {/* Simplistic Markdown Support */}
                  <div className="prose dark:prose-invert prose-xs max-w-none space-y-1 font-sans">
                    {msg.content.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={lIdx} className="font-black text-slate-800 dark:text-slate-100 text-xs tracking-wide pt-1 pb-0.5">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('*   ') || line.startsWith('* ')) {
                        return <li key={lIdx} className="list-disc list-inside ml-2 py-0.5">{line.replace(/^\*   |^\* /, '')}</li>;
                      }
                      // bold conversions
                      const boldParts = line.split('**');
                      if (boldParts.length > 1) {
                        return (
                          <p key={lIdx}>
                            {boldParts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-indigo-600 dark:text-indigo-400">{part}</strong> : part)}
                          </p>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })}
                  </div>
                </div>

                {/* Offline Simulation Mode disclaimer */}
                {msg.warning && (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono tracking-tighter block text-right">
                    ⚠️ {msg.warning}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="p-2 rounded-xl shrink-0 h-9 w-9 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="p-3 bg-white dark:bg-[#1a1b26] border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick prompts panel */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none select-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-2.5 py-1 text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-full shrink-0 shadow-sm font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {prompt.replace("Show today's traffic alternate routes.", "Traffic Alt Roads")}
          </button>
        ))}
      </div>

      {/* Message input bar */}
      <div className="p-3 bg-white dark:bg-[#1a1b26] border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
        <input
          placeholder="Ask Metropolis Central AI about city telemetry..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={() => handleSendMessage(input)}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
