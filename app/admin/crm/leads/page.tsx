'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Phone,
  MessageCircle,
  Eye,
  Filter,
  Download,
  UserPlus,
  Search
} from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { useLeads } from '@/lib/hooks/useLeads';
import { useRealtimeLeads } from '@/lib/hooks/useRealtime';
import { formatRelativeTime, formatPhoneNumber } from '@/lib/utils/formatters';
import { LeadStatus, LeadSource } from '@/types/database';

const LEAD_STATUSES: { value: LeadStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'not_picked', label: 'Not Picked' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'interested', label: 'Interested' },
  { value: 'order_confirmed', label: 'Converted' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'callback', label: 'Callback' },
];

const LEAD_SOURCES: { value: LeadSource | ''; label: string }[] = [
  { value: '', label: 'All Sources' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'manual', label: 'Manual' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone' },
];

export default function CRMLeadsPage() {
  const searchParams = useSearchParams();
  const showMyLeads = searchParams.get('my') === 'true';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null);

  const {
    leads,
    total,
    page,
    totalPages,
    isLoading,
    fetchLeads,
    updateLeadStatus,
    logCall,
  } = useLeads({
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    search: search || undefined,
  });

  // Realtime updates
  useRealtimeLeads(undefined, {
    onNewLead: () => fetchLeads(),
    onLeadUpdate: () => fetchLeads(),
  });

  const handleQuickStatusChange = async (leadId: string, status: LeadStatus) => {
    await updateLeadStatus(leadId, status);
    setShowQuickActions(null);
  };

  const handleCall = (phone: string, leadId: string) => {
    window.open(`tel:${phone}`, '_self');
    // Log the call attempt
    logCall(leadId, 'attempted', 'Call initiated from CRM');
  };

  const handleWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
    window.open(`https://wa.me/${phoneWithCountry}`, '_blank');
  };

  const columns = [
    {
      key: 'lead',
      header: 'Lead',
      render: (lead: any) => (
        <div>
          <p className="font-medium text-gray-900">{lead.full_name}</p>
          <p className="text-sm text-gray-500">{formatPhoneNumber(lead.phone)}</p>
          {lead.email && <p className="text-xs text-gray-400">{lead.email}</p>}
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (lead: any) => (
        <div>
          <p className="capitalize text-gray-900">{lead.source.replace('_', ' ')}</p>
          {lead.source_campaign && (
            <p className="text-xs text-gray-500 truncate max-w-[150px]">
              {lead.source_campaign}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: any) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickActions(showQuickActions === lead.id ? null : lead.id);
            }}
            className="hover:opacity-80"
          >
            <LeadStatusBadge status={lead.status} />
          </button>
          
          {/* Quick status change dropdown */}
          {showQuickActions === lead.id && (
            <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[150px]">
              {LEAD_STATUSES.filter(s => s.value && s.value !== lead.status).map((status) => (
                <button
                  key={status.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickStatusChange(lead.id, status.value as LeadStatus);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {status.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned To',
      render: (lead: any) => (
        <div>
          {lead.assigned_team_member ? (
            <>
              <p className="text-gray-900">{lead.assigned_team_member.user?.full_name}</p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(lead.assigned_at)}
              </p>
            </>
          ) : (
            <span className="text-gray-400">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'activity',
      header: 'Activity',
      render: (lead: any) => (
        <div className="text-sm">
          <p className="text-gray-600">
            {lead.call_attempts} calls
          </p>
          {lead.next_follow_up && (
            <p className="text-xs text-orange-600">
              Follow-up: {formatRelativeTime(lead.next_follow_up)}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {formatRelativeTime(lead.created_at)}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lead: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCall(lead.phone, lead.id);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleWhatsApp(lead.phone);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <Link
            href={`/admin/crm/leads/${lead.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showMyLeads ? 'My Leads' : 'All Leads'}
          </h1>
          <p className="text-gray-600 mt-1">{total} total leads</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/crm/leads/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4" />
            Add Lead
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          {LEAD_SOURCES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={leads}
        keyExtractor={(lead) => lead.id}
        isLoading={isLoading}
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: (p) => fetchLeads(p),
        }}
        onRowClick={(lead) => {
          window.location.href = `/admin/crm/leads/${lead.id}`;
        }}
      />

      {/* Click outside to close quick actions */}
      {showQuickActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowQuickActions(null)}
        />
      )}
    </div>
  );
}