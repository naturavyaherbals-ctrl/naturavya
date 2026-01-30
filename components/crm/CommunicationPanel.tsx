import { CallLog, WhatsAppMessage, WhatsAppTemplate } from '@/types/crm';
import { cn } from '@/utils/cn';
import {
  MessageCircle,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Send,
  Clock,
  Check,
  CheckCheck,
  X,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

interface CommunicationPanelProps {
  callLogs: CallLog[];
  whatsappMessages: WhatsAppMessage[];
  templates: WhatsAppTemplate[];
  onSendWhatsApp: (message: string, templateName?: string) => Promise<void>;
  onLogCall: () => void;
}

const callStatusConfig = {
  completed: { icon: Phone, color: 'text-green-600', bg: 'bg-green-100' },
  missed: { icon: PhoneMissed, color: 'text-red-600', bg: 'bg-red-100' },
  no_answer: { icon: PhoneMissed, color: 'text-amber-600', bg: 'bg-amber-100' },
  busy: { icon: PhoneMissed, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const waStatusConfig = {
  sent: { icon: Check, color: 'text-gray-400' },
  delivered: { icon: CheckCheck, color: 'text-gray-400' },
  read: { icon: CheckCheck, color: 'text-blue-500' },
  failed: { icon: X, color: 'text-red-500' },
};

export function CommunicationPanel({
  callLogs,
  whatsappMessages,
  templates,
  onSendWhatsApp,
  onLogCall,
}: CommunicationPanelProps) {
  const [activeTab, setActiveTab] = useState<'calls' | 'whatsapp'>('whatsapp');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await onSendWhatsApp(message);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: WhatsAppTemplate) => {
    setMessage(template.content);
    setShowTemplates(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
      {/* Header with Tabs */}
      <div className="flex items-center border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
            activeTab === 'whatsapp'
              ? 'border-green-500 text-green-700 bg-green-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
          {whatsappMessages.length > 0 && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
              {whatsappMessages.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
            activeTab === 'calls'
              ? 'border-blue-500 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Phone className="w-4 h-4" />
          Calls
          {callLogs.length > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
              {callLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'whatsapp' ? (
          <div className="space-y-3">
            {whatsappMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              whatsappMessages.map((msg) => {
                const status = waStatusConfig[msg.status] || waStatusConfig.sent;
                const StatusIcon = status.icon;
                const isOutbound = msg.direction === 'outbound';

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'max-w-[85%] p-3 rounded-lg text-sm',
                      isOutbound
                        ? 'ml-auto bg-green-100 text-green-900 rounded-br-sm'
                        : 'mr-auto bg-gray-100 text-gray-900 rounded-bl-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1 text-xs',
                      isOutbound ? 'justify-end text-green-700' : 'text-gray-500'
                    )}>
                      <span>{formatTime(msg.created_at)}</span>
                      {isOutbound && <StatusIcon className={cn('w-3.5 h-3.5', status.color)} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {callLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Phone className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No call logs</p>
              </div>
            ) : (
              callLogs.map((call) => {
                const status = callStatusConfig[call.status] || callStatusConfig.missed;
                const isInbound = call.direction === 'inbound';
                const DirectionIcon = isInbound ? PhoneIncoming : PhoneOutgoing;

                return (
                  <div
                    key={call.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', status.bg)}>
                      <DirectionIcon className={cn('w-5 h-5', status.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 capitalize">
                          {call.status.replace('_', ' ')}
                        </span>
                        {call.duration_seconds > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(call.duration_seconds)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span>{isInbound ? 'Incoming' : 'Outgoing'}</span>
                        {call.agent_name && <span>• {call.agent_name}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(call.created_at)}</span>
                  </div>
                );
              })
            )}

            {/* Log Call Button */}
            <button
              onClick={onLogCall}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Log a Call
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp Input */}
      {activeTab === 'whatsapp' && (
        <div className="border-t border-gray-100 p-3 bg-gray-50/50">
          {/* Templates Dropdown */}
          <div className="relative mb-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Templates
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showTemplates && 'rotate-180')} />
            </button>

            {showTemplates && templates.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                <div className="max-h-48 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <p className="text-xs font-medium text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{template.content}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              rows={2}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className={cn(
                'p-2.5 rounded-lg transition-colors',
                message.trim() && !sending
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
