'use client';

// =====================================================
// LEAD TABLE - FULL FEATURED DATA TABLE WITH AI
// =====================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import RoleGuard from '@/components/admin/RoleGuard';
import LeadStatusButtons from './LeadStatusButtons';
import LeadDetailModal from './LeadDetailModal';
import AssignLeadModal from './AssignLeadModal';
import {
  Phone,
  MessageCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Calendar,
  ExternalLink,
  UserPlus,
  Flame,
  Thermometer,
  Snowflake,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Lead, LeadStatus } from '@/types';
import { LEAD_STATUS_CONFIG } from '@/types';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onStatusUpdate: (leadId: string, status: LeadStatus, notes?: string) => void;
  onAssign: (leadId: string, assigneeId: string) => void;
  showAssignColumn: boolean;
  currentPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}>
      <Icon className="w-3 h-3" />
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor}`}>
      Score: {score}
    </span>
  );
}

// =====================================================
// AI SUGGESTION COMPONENT
// =====================================================

function AISuggestion({ suggestion }: { suggestion?: string | null }) {
  if (!suggestion) return null;

  return (
    <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
      <div className="flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 leading-tight">{suggestion}</p>
      </div>
    </div>
  );
}

export default function LeadTable({
  leads,
  isLoading,
  onStatusUpdate,
  onAssign,
  showAssignColumn,
  currentPage,
  totalCount,
  onPageChange,
}: LeadTableProps) {
  const { hasPermission } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<Lead | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lead Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  AI Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                {showAssignColumn && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned To
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Follow-up
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead: Lead & { temperature?: string; score?: number; ai_suggested_action?: string }) => (
                <React.Fragment key={lead.id}>
                  <tr
                    className={`hover:bg-gray-50 ${expandedRow === lead.id ? 'bg-blue-50' : ''} ${
                      lead.temperature === 'hot' ? 'bg-red-50/30' : ''
                    }`}
                    onClick={() => setExpandedRow(expandedRow === lead.id ? null : lead.id)}
                  >
                    {/* Lead Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          lead.temperature === 'hot' 
                            ? 'bg-red-100' 
                            : lead.temperature === 'warm'
                            ? 'bg-orange-100'
                            : 'bg-gray-100'
                        }`}>
                          <User className={`w-5 h-5 ${
                            lead.temperature === 'hot' 
                              ? 'text-red-500' 
                              : lead.temperature === 'warm'
                              ? 'text-orange-500'
                              : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.full_name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                          </div>
                          {lead.city && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {lead.city}, {lead.state}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* AI Score Column */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <TemperatureBadge temperature={lead.temperature} />
                        <LeadScoreBadge score={lead.score} />
                      </div>
                    </td>

                    {/* Contact Buttons */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </a>
                        <a
                          href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                            `Hi ${lead.full_name || ''}, this is regarding your inquiry at Naturavya Herbals.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{lead.phone}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <LeadStatusButtons
                        leadId={lead.id}
                        currentStatus={lead.status}
                        onStatusChange={onStatusUpdate}
                        compact
                      />
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize w-fit">
                          {lead.source.replace('_', ' ')}
                        </span>
                        {lead.campaign_name && (
                          <span className="text-xs text-gray-500 truncate max-w-[120px]" title={lead.campaign_name}>
                            {lead.campaign_name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned To */}
                    {showAssignColumn && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {lead.assigned_team_member ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {lead.assigned_team_member.user?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="text-sm font-medium truncate max-w-[100px]">
                              {lead.assigned_team_member.user?.full_name}
                            </span>
                          </div>
                        ) : (
                          <RoleGuard permission="assign_lead">
                            <button
                              onClick={() => setShowAssignModal(lead)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <UserPlus className="w-3 h-3" />
                              Assign
                            </button>
                          </RoleGuard>
                        )}
                      </td>
                    )}

                    {/* Follow-up */}
                    <td className="px-4 py-3">
                      {lead.next_follow_up_at ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600">
                            {formatDistanceToNow(new Date(lead.next_follow_up_at), { addSuffix: true })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not scheduled</span>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lead.follow_up_count} follow-ups
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </button>
                        <Link
                          href={`/admin/crm/leads/${lead.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Full Page"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row with AI Suggestion */}
                  {expandedRow === lead.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={showAssignColumn ? 8 : 7} className="px-4 py-4">
                        <div className="grid md:grid-cols-4 gap-4">
                          {/* AI Suggestion */}
                          {lead.ai_suggested_action && (
                            <div className="md:col-span-4">
                              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <h4 className="text-sm font-medium text-amber-800">AI Recommendation</h4>
                                    <p className="text-sm text-amber-700 mt-1">{lead.ai_suggested_action}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Phone:</strong> {lead.phone}</p>
                              {lead.alternate_phone && <p><strong>Alt Phone:</strong> {lead.alternate_phone}</p>}
                              {lead.email && <p><strong>Email:</strong> {lead.email}</p>}
                              {lead.whatsapp_number && <p><strong>WhatsApp:</strong> {lead.whatsapp_number}</p>}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                            <div className="space-y-1 text-sm">
                              {lead.address && <p>{lead.address}</p>}
                              <p>{[lead.city, lead.state, lead.postal_code].filter(Boolean).join(', ')}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Lead Score Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Temperature:</strong> {lead.temperature || 'Not scored'}</p>
                              <p><strong>Score:</strong> {lead.score || 0}/100</p>
                              <p><strong>Call Attempts:</strong> {lead.call_attempts || 0}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                            <p className="text-sm text-gray-600">{lead.notes || 'No notes added'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={showAssignColumn ? 8 : 7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Phone className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No leads found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updated) => {
            setSelectedLead(null);
          }}
        />
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && (
        <AssignLeadModal
          lead={showAssignModal}
          onClose={() => setShowAssignModal(null)}
          onAssign={(assigneeId) => {
            onAssign(showAssignModal.id, assigneeId);
            setShowAssignModal(null);
          }}
        />
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-100" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 border-t bg-gray-50" />
      ))}
    </div>
  );
}
