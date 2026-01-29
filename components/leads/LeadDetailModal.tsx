import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge, TemperatureBadge, LeadScoreBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  X, 
  Phone, 
  MessageCircle, 
  User,
  MapPin,
  Sparkles,
  Clock,
  Calendar,
  MessageSquare,
  Copy,
  CheckCircle,
  TrendingUp,
  Send
} from 'lucide-react';
import type { Lead } from '@/types';
import { HINGLISH_TEMPLATES, AI_SUGGESTIONS } from '@/data/mockData';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'ai' | 'messages'>('info');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(id);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  // Get AI suggestions based on lead status
  const getSuggestions = () => {
    if (lead.temperature === 'hot') return AI_SUGGESTIONS.hot_lead;
    if (lead.temperature === 'warm') return AI_SUGGESTIONS.warm_lead;
    return AI_SUGGESTIONS.cold_lead;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{lead.full_name || 'Unknown Lead'}</h2>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Phone className="w-4 h-4" />
                {lead.phone}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TemperatureBadge temperature={lead.temperature} />
            <LeadScoreBadge score={lead.score} />
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* AI Suggestion Banner */}
        {lead.ai_suggested_action && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-amber-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800">🤖 AI Suggestion:</p>
                <p className="text-amber-700">{lead.ai_suggested_action}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'info', label: 'Lead Info', icon: User },
            { id: 'ai', label: '🤖 AI Messages', icon: Sparkles },
            { id: 'messages', label: 'Quick Replies', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Lead Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoCard icon={MapPin} label="Location" value={`${lead.city || '-'}, ${lead.state || '-'}`} />
                <InfoCard icon={TrendingUp} label="Source" value={lead.source.replace('_', ' ')} />
                <InfoCard icon={Calendar} label="Created" value={new Date(lead.created_at).toLocaleDateString()} />
                <InfoCard icon={Clock} label="Last Contact" value={lead.last_call_at ? new Date(lead.last_call_at).toLocaleString() : 'Never'} />
              </div>

              {/* Campaign Info */}
              {lead.source_campaign && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">📊 Campaign Info</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Campaign:</span>
                      <span className="font-medium">{lead.source_campaign}</span>
                    </div>
                    {lead.source_adset && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ad Set:</span>
                        <span className="font-medium">{lead.source_adset}</span>
                      </div>
                    )}
                    {lead.source_ad && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ad:</span>
                        <span className="font-medium">{lead.source_ad}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* AI Insights */}
              {lead.ai_insights && lead.ai_insights.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    AI Insights
                  </h4>
                  <div className="space-y-2">
                    {lead.ai_insights.map((insight, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100"
                      >
                        <p className="text-sm text-amber-800">{insight.message}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Confidence: {insight.confidence}%
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Notes */}
              {lead.notes && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">📝 Notes</h4>
                  <p className="text-gray-600">{lead.notes}</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm mb-4">
                🤖 AI-generated Hinglish messages based on lead behavior:
              </p>

              {/* Suggested Message */}
              {lead.ai_suggested_message && (
                <Card className="p-4 border-2 border-indigo-200 bg-indigo-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-indigo-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Recommended Message
                    </h4>
                    <Button
                      size="sm"
                      variant={copiedMessage === 'ai' ? 'success' : 'secondary'}
                      onClick={() => copyToClipboard(lead.ai_suggested_message || '', 'ai')}
                    >
                      {copiedMessage === 'ai' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedMessage === 'ai' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{lead.ai_suggested_message}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="whatsapp"
                      icon={<Send className="w-4 h-4" />}
                      onClick={() => {
                        const encodedMessage = encodeURIComponent(lead.ai_suggested_message || '');
                        window.open(`https://wa.me/91${lead.phone}?text=${encodedMessage}`, '_blank');
                      }}
                    >
                      Send via WhatsApp
                    </Button>
                  </div>
                </Card>
              )}

              {/* Template Messages */}
              <h4 className="font-semibold mt-6">📋 Template Messages:</h4>
              {HINGLISH_TEMPLATES.filter(t => t.temperature === lead.temperature).map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium">{template.name}</h5>
                      <Badge variant={template.temperature} size="sm">
                        {template.temperature.toUpperCase()}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant={copiedMessage === template.id ? 'success' : 'ghost'}
                      onClick={() => {
                        const personalizedMessage = template.message
                          .replace('{{name}}', lead.full_name || 'Customer')
                          .replace('{{product}}', lead.interested_products?.[0] || 'our products')
                          .replace('{{agent_name}}', 'Naturavya Team');
                        copyToClipboard(personalizedMessage, template.id);
                      }}
                    >
                      {copiedMessage === template.id ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {template.message
                      .replace('{{name}}', lead.full_name || 'Customer')
                      .replace('{{product}}', lead.interested_products?.[0] || 'our products')
                      .replace('{{agent_name}}', 'Naturavya Team')}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm mb-4">
                💡 Quick action suggestions based on lead status:
              </p>

              {getSuggestions().map((suggestion, i) => (
                <Card key={i} className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="text-gray-700">{suggestion}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex items-center gap-3">
          <Button
            variant="success"
            icon={<Phone className="w-4 h-4" />}
            onClick={() => window.open(`tel:${lead.phone}`)}
            className="flex-1"
          >
            Call Now
          </Button>
          <Button
            variant="whatsapp"
            icon={<MessageCircle className="w-4 h-4" />}
            onClick={() => window.open(`https://wa.me/91${lead.phone}`, '_blank')}
            className="flex-1"
          >
            WhatsApp
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
