import { useState } from 'react';
import { Badge, TemperatureBadge, LeadScoreBadge } from '@/components/ui/Badge';
import { 
  Phone, 
  MessageCircle, 
  User,
  MapPin,
  Sparkles,
  GripVertical
} from 'lucide-react';
import type { Lead, LeadStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface LeadPipelineProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

const PIPELINE_COLUMNS: { status: LeadStatus; title: string; color: string; emoji: string }[] = [
  { status: 'new', title: 'New Leads', color: 'border-t-blue-500', emoji: '🆕' },
  { status: 'not_picked', title: 'Not Picked', color: 'border-t-gray-500', emoji: '📵' },
  { status: 'follow_up', title: 'Follow Up', color: 'border-t-orange-500', emoji: '🔄' },
  { status: 'interested', title: 'Interested', color: 'border-t-purple-500', emoji: '👀' },
  { status: 'hot_lead', title: 'Hot Leads', color: 'border-t-red-500', emoji: '🔥' },
  { status: 'order_confirmed', title: 'Confirmed', color: 'border-t-green-500', emoji: '✅' },
];

export function LeadPipeline({ leads, onLeadClick }: LeadPipelineProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  // Group leads by status
  const groupedLeads = PIPELINE_COLUMNS.reduce((acc, column) => {
    acc[column.status] = leads.filter(lead => lead.status === column.status);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedLead && draggedLead.status !== newStatus) {
      console.log(`Moving lead ${draggedLead.full_name} to ${newStatus}`);
      // Here you would update the lead status via API
    }
    setDraggedLead(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_COLUMNS.map((column) => (
        <div
          key={column.status}
          className={`flex-shrink-0 w-80 bg-gray-50 rounded-xl overflow-hidden transition-all ${
            dragOverColumn === column.status ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, column.status)}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          {/* Column Header */}
          <div className={`p-4 border-t-4 ${column.color} bg-white`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {column.emoji} {column.title}
              </h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                {groupedLeads[column.status]?.length || 0}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
            {groupedLeads[column.status]?.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onDragStart={handleDragStart}
                isDragging={draggedLead?.id === lead.id}
                onClick={() => onLeadClick(lead)}
              />
            ))}

            {groupedLeads[column.status]?.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                Koi lead nahi hai
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  isDragging: boolean;
  onClick: () => void;
}

function LeadCard({ lead, onDragStart, isDragging, onClick }: LeadCardProps) {
  const isOverdue = lead.next_follow_up && new Date(lead.next_follow_up) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={onClick}
      className={`bg-white rounded-lg border shadow-sm p-3 cursor-pointer transition-all ${
        isDragging ? 'opacity-50 scale-95 rotate-2' : 'hover:shadow-md hover:border-indigo-200'
      } ${isOverdue ? 'border-l-4 border-l-red-500 animate-pulse' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TemperatureBadge temperature={lead.temperature} />
        </div>
      </div>

      {/* Content */}
      <div className="ml-6">
        <p className="font-medium text-gray-900 truncate">{lead.full_name || 'Unknown'}</p>
        <p className="text-sm text-gray-500">{lead.phone}</p>

        {lead.city && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin className="w-3 h-3" />
            {lead.city}
          </div>
        )}

        {/* AI Suggestion */}
        {lead.ai_suggested_action && (
          <div className="mt-2 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                {lead.ai_suggested_action}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <div className="flex-1" />
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Tags & Score */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <LeadScoreBadge score={lead.score} />
          <Badge variant="default">
            {lead.source.replace('_', ' ')}
          </Badge>
          {isOverdue && (
            <Badge variant="danger">⚠️ Overdue</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
