import { Lead } from '@/types/crm';
import { cn } from '@/utils/cn';
import {
  Bot,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Phone,
  Lightbulb,
  Shield,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

interface AIAssistantPanelProps {
  lead: Lead;
  onGenerateScript: () => Promise<void>;
  onSendWhatsApp: (message: string) => Promise<void>;
  isGenerating: boolean;
}

type AITab = 'script' | 'objections' | 'next_action';

export function AIAssistantPanel({
  lead,
  onGenerateScript,
  onSendWhatsApp,
  isGenerating,
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<AITab>('script');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendScript = async () => {
    if (!lead.ai_suggested_message) return;
    setSending(true);
    try {
      await onSendWhatsApp(lead.ai_suggested_message);
    } finally {
      setSending(false);
    }
  };

  const tabs = [
    { id: 'script' as AITab, label: 'Call Script', icon: Phone },
    { id: 'objections' as AITab, label: 'Objections', icon: Shield },
    { id: 'next_action' as AITab, label: 'Next Action', icon: ArrowRight },
  ];

  const getContent = () => {
    switch (activeTab) {
      case 'script':
        return lead.ai_suggested_message;
      case 'objections':
        return lead.ai_objection_handling;
      case 'next_action':
        return lead.ai_next_action;
    }
  };

  const content = getContent();
  const hasAnyContent = lead.ai_suggested_message || lead.ai_objection_handling || lead.ai_next_action;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          AI Assistant
        </h2>
        <button
          onClick={onGenerateScript}
          disabled={isGenerating}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            isGenerating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-sm'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : hasAnyContent ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-violet-500 text-violet-700 bg-violet-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {!hasAnyContent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Generate AI Insights</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
              Get personalized call scripts, objection handling tips, and recommended next actions based on lead data.
            </p>
            <button
              onClick={onGenerateScript}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generate Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {content ? (
              <>
                {/* Content Box */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[120px] max-h-[300px] overflow-y-auto">
                    {content}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(content, activeTab)}
                    className="absolute top-2 right-2 p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                    title="Copy to clipboard"
                  >
                    {copiedField === activeTab ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Action Buttons for Script */}
                {activeTab === 'script' && lead.ai_suggested_message && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendScript}
                      disabled={sending}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                        sending
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                      )}
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
                      )}
                      Send via WhatsApp
                    </button>
                    <button
                      onClick={() => copyToClipboard(lead.ai_suggested_message!, 'script-btn')}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {copiedField === 'script-btn' ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No {activeTab.replace('_', ' ')} generated yet.</p>
                <p className="text-xs mt-1">Click "Regenerate" to generate this content.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
