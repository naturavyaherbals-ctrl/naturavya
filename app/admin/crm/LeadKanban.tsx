'use client';

// =====================================================
// LEAD KANBAN - DRAG & DROP KANBAN BOARD WITH AI
// =====================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  User,
  Clock,
  MapPin,
  GripVertical,
  MoreHorizontal,
  Flame,
  Thermometer,
  Snowflake,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Lead, LeadStatus } from '@/types';
import { LEAD_STATUS_CONFIG } from '@/types';

interface LeadKanbanProps {
  leads: Lead[];
  isLoading: boolean;
  onStatusUpdate: (leadId: string, status: LeadStatus, notes?: string) => void;
  onAssign: (leadId: string, assigneeId: string) => void;
}

// Kanban columns configuration
const KANBAN_COLUMNS: { status: LeadStatus; title: string; color: string }[] = [
  { status: 'new', title: 'New Leads', color: 'border-blue-500' },
  { status: 'not_picked', title: 'Not Picked', color: 'border-gray-500' },
  { status: 'follow_up', title: 'Follow Up', color: 'border-orange-500' },
  { status: 'interested', title: 'Interested', color: 'border-purple-500' },
  { status: 'hot_lead', title: 'Hot Leads', color: 'border-red-500' },
  { status: 'order_confirmed', title: 'Confirmed', color: 'border-green-500' },
];

export default function LeadKanban({
  leads,
  isLoading,
  onStatusUpdate,
  onAssign,
}: LeadKanbanProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  // Group leads by status
  const groupedLeads = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.status] = leads.filter(lead => lead.status === column.status);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedLead && draggedLead.status !== newStatus) {
      const allowedNextSteps = LEAD_STATUS_CONFIG[draggedLead.status]?.nextSteps || [];
      if (allowedNextSteps.includes(newStatus) || newStatus === draggedLead.status) {
        await onStatusUpdate(draggedLead.id, newStatus);
      } else {
        alert(`Cannot move lead from "${draggedLead.status}" to "${newStatus}"`);
      }
    }

    setDraggedLead(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((column) => (
        <div
          key={column.status}
          className={`flex-shrink-0 w-80 bg-gray-50 rounded-xl overflow-hidden transition-all ${
            dragOverColumn === column.status ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, column.status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          {/* Column Header */}
          <div className={`p-4 border-t-4 ${column.color} bg-white`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {groupedLeads[column.status]?.length || 0}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
            {groupedLeads[column.status]?.map((lead) => (
              <KanbanCard
                key={lead.id}
                lead={lead}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={draggedLead?.id === lead.id}
              />
            ))}

            {groupedLeads[column.status]?.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No leads in this column
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// TEMPERATURE BADGE COMPONENT
// =====================================================

function TemperatureBadge({ temperature }: { temperature?: string | null }) {
  if (!temperature) return null;

  const config: Record<string, { label: string; bg: string; icon: React.ElementType }> = {
    hot: { label: 'HOT', bg: 'bg-red-500 text-white', icon: Flame },
    warm: { label: 'WARM', bg: 'bg-orange-100 text-orange-700', icon: Thermometer },
    cold: { label: 'COLD', bg: 'bg-blue-100 text-blue-700', icon: Snowflake },
  };

  const { label, bg, icon: Icon } = config[temperature] || config.warm;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${bg}`}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// =====================================================
// LEAD SCORE BADGE COMPONENT
// =====================================================

function LeadScoreBadge({ score }: { score?: number | null }) {
  if (score === null || score === undefined) return null;

  let bgColor = 'bg-gray-100 text-gray-600';
  if (score >= 75) bgColor = 'bg-green-100 text-green-700';
  else if (score >= 50) bgColor = 'bg-yellow-100 text-yellow-700';
  else if (score >= 25) bgColor = 'bg-orange-100 text-orange-700';
  else bgColor = 'bg-red-100 text-red-700';

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${bgColor}`}>
      {score}
    </span>
  );
}

// =====================================================
// KANBAN CARD WITH AI FEATURES
// =====================================================

interface KanbanCardProps {
  lead: Lead & {
    temperature?: string | null;
    score?: number | null;
    ai_suggested_action?: string | null;
  };
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function KanbanCard({ lead, onDragStart, onDragEnd, isDragging }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-lg border shadow-sm p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 scale-95 rotate-2' : 'hover:shadow-md'
      } ${lead.temperature === 'hot' ? 'border-l-4 border-l-red-500' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-300" />
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Temperature & Score Badges */}
          <TemperatureBadge temperature={lead.temperature} />
          <LeadScoreBadge score={lead.score} />
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border py-1 z-20">
                  <Link
                    href={`/admin/crm/leads/${lead.id}`}
                    className="block px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  <a
                    href={`tel:${lead.phone}`}
                    className="block px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Call
                  </a>
                  <a
                    href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ml-6">
        <p className="font-medium text-gray-900 truncate">
          {lead.full_name || 'Unknown'}
        </p>
        <p className="text-sm text-gray-500">{lead.phone}</p>

        {lead.city && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin className="w-3 h-3" />
            {lead.city}
          </div>
        )}

        {/* AI Suggested Action */}
        {lead.ai_suggested_action && (
          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 leading-tight">
                {lead.ai_suggested_action}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
          <a
            href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
          <div className="flex-1" />
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded capitalize">
            {lead.source.replace('_', ' ')}
          </span>
          {lead.priority === 'urgent' && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">
              Urgent
            </span>
          )}
          {lead.priority === 'high' && (
            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
              High
            </span>
          )}
        </div>

        {/* Assigned To */}
        {lead.assigned_team_member && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-medium text-primary">
                {lead.assigned_team_member.user?.full_name?.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-500 truncate">
              {lead.assigned_team_member.user?.full_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// SKELETON
// =====================================================

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80 bg-gray-100 rounded-xl h-96" />
      ))}
    </div>
  );
}
