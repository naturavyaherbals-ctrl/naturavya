'use client';

import { useState } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function AiAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste 👋 Main Naturavya ka AI sales helper hoon. Aap lead follow-up, script, objections ya RTO control ke baare me pooch sakte ho.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('AI chat error:', data);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'System thoda busy hai. Thodi der baad dubara try karo ya apna question short karke bhejo.',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply as string },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Network issue aa gaya. Thodi der baad dubara try karo.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-green-600 text-white shadow-lg shadow-green-300 w-12 h-12 flex items-center justify-center hover:bg-green-700"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[480px]">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100 text-green-700">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Naturavya Sales AI
                </p>
                <p className="text-[11px] text-gray-500">
                  Scripts • Objections • RTO control • Follow-ups
                </p>
              </div>
            </div>
            <button
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm bg-gray-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Soch raha hoon...
              </div>
            )}
          </div>

          <div className="border-t px-3 py-2">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. PCOS lead ke liye script bana do..."
                className="flex-1 resize-none text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}