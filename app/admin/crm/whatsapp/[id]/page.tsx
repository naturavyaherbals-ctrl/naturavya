'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Phone,
  MoreVertical,
  User,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Zap,
  X,
} from 'lucide-react';
import { formatDateTime, formatRelativeTime, formatPhoneNumber } from '@/lib/utils/formatters';
import { useRealtime } from '@/lib/hooks/useRealtime';

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  message_type: string;
  content: string | null;
  media_url: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  sender_name: string | null;
}

interface Conversation {
  id: string;
  contact_phone: string;
  contact_name: string | null;
  status: string;
  window_expires_at: string | null;
  lead: any;
  assigned_team_member: any;
  whatsapp_account: any;
}

interface QuickReply {
  id: string;
  title: string;
  shortcut: string | null;
  message: string;
  category: string | null;
}

interface PageProps {
  params: { id: string };
}

export default function WhatsAppChatPage({ params }: PageProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Realtime updates for new messages
  useRealtime({
    table: 'whatsapp_messages',
    filter: `conversation_id=eq.${params.id}`,
    onInsert: (message) => {
      setMessages((prev) => [...prev, message as Message]);
      scrollToBottom();
    },
    onUpdate: ({ new: updatedMessage }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? (updatedMessage as Message) : m))
      );
    },
  });

  useEffect(() => {
    fetchConversation();
    fetchQuickReplies();
    fetchTemplates();
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/whatsapp/conversations/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setConversation(data.conversation);
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuickReplies = async () => {
    try {
      const response = await fetch('/api/admin/whatsapp/quick-replies');
      const data = await response.json();
      if (data.success) {
        setQuickReplies(data.quickReplies);
      }
    } catch (err) {
      console.error('Failed to fetch quick replies:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/whatsapp/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const isWindowOpen = () => {
    if (!conversation?.window_expires_at) return false;
    return new Date(conversation.window_expires_at) > new Date();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    // Check if window is open
    if (!isWindowOpen()) {
      alert('The 24-hour messaging window has expired. You can only send template messages.');
      setShowTemplates(true);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/admin/whatsapp/conversations/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text',
          message: messageText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessageText('');
        // Message will be added via realtime subscription
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTemplate = async (template: any, variables: string[]) => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/admin/whatsapp/conversations/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          templateName: template.name,
          variables,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowTemplates(false);
      } else {
        alert(data.error || 'Failed to send template');
      }
    } catch (err) {
      console.error('Send template error:', err);
      alert('Failed to send template');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    setMessageText(reply.message);
    setShowQuickReplies(false);
    inputRef.current?.focus();

    // Update usage count
    fetch('/api/admin/whatsapp/quick-replies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reply.id }),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check for quick reply shortcuts
    if (e.key === '/' && messageText === '') {
      setShowQuickReplies(true);
    }

    // Send on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getMessageStatusIcon = (message: Message) => {
    if (message.direction !== 'outbound') return null;

    switch (message.status) {
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-300" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Conversation not found</p>
        <Link href="/admin/crm/whatsapp" className="text-green-600 hover:text-green-700 mt-4 inline-block">
          Back to Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/crm/whatsapp"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {conversation.contact_name || formatPhoneNumber(conversation.contact_phone)}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatPhoneNumber(conversation.contact_phone)}</span>
                {!isWindowOpen() && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Template only
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.lead && (
            <Link
              href={`/admin/crm/leads/${conversation.lead.id}`}
              className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg"
            >
              View Lead
            </Link>
          )}
          <a
            href={`tel:${conversation.contact_phone}`}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Phone className="w-5 h-5" />
          </a>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50" style={{ backgroundImage: 'url(/whatsapp-bg.png)' }}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.direction === 'outbound'
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                }`}
              >
                {/* Message content */}
                {message.message_type === 'text' && (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}

                {message.message_type === 'image' && (
                  <div>
                    {message.media_url && (
                      <img
                        src={message.media_url}
                        alt="Image"
                        className="rounded-lg max-w-full mb-2"
                      />
                    )}
                    {message.content && <p>{message.content}</p>}
                  </div>
                )}

                {message.message_type === 'document' && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    <span>{message.content || 'Document'}</span>
                  </div>
                )}

                {message.message_type === 'template' && (
                  <div>
                    <div className="flex items-center gap-1 mb-1 text-xs opacity-75">
                      <Zap className="w-3 h-3" />
                      Template
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}

                {/* Timestamp and status */}
                <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                  message.direction === 'outbound' ? 'text-green-100' : 'text-gray-400'
                }`}>
                  <span>
                    {new Date(message.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {getMessageStatusIcon(message)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Window Expired Warning */}
      {!isWindowOpen() && (
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">
              The 24-hour messaging window has expired. You can only send pre-approved template messages.
            </span>
            <button
              onClick={() => setShowTemplates(true)}
              className="ml-auto text-sm font-medium text-yellow-900 hover:underline"
            >
              Send Template
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isWindowOpen() ? 'Type a message... (/ for quick replies)' : 'Window expired - use templates'}
              disabled={!isWindowOpen()}
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ maxHeight: '120px' }}
            />

            {/* Quick Replies Dropdown */}
            {showQuickReplies && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border max-h-64 overflow-y-auto">
                <div className="p-2 border-b flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Quick Replies</span>
                  <button
                    onClick={() => setShowQuickReplies(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {quickReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{reply.title}</span>
                      {reply.shortcut && (
                        <span className="text-xs text-gray-400">{reply.shortcut}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{reply.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Quick Replies"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Templates"
          >
            <Zap className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!messageText.trim() || isSending || !isWindowOpen()}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowTemplates(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Send Template</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {templates.filter(t => t.status === 'approved').length === 0 ? (
                <p className="text-center text-gray-500">No approved templates available</p>
              ) : (
                <div className="space-y-4">
                  {templates
                    .filter(t => t.status === 'approved')
                    .map((template) => (
                      <div
                        key={template.id}
                        className="border rounded-lg p-4 hover:border-green-500 cursor-pointer"
                        onClick={() => {
                          // For simplicity, sending with empty variables
                          // In production, you'd show a form to fill variables
                          const variables = template.variables
                            ? Object.keys(template.variables).map(() => '')
                            : [];
                          handleSendTemplate(template, variables);
                        }}
                      >
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                          {template.body_text}
                        </p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          {template.category}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}