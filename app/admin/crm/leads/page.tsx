'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import {
  Phone,
  MessageCircle,
  Eye,
  Filter,
  Download,
  UserPlus,
  Search,
  RefreshCw
} from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { useLeads } from '@/lib/hooks/useLeads';
import { useRealtimeLeads } from '@/lib/hooks/useRealtime';
import { formatRelativeTime, formatPhoneNumber } from '@/lib/utils/formatters';
import { LeadStatus, LeadSource } from '@/types/database';
import { createClient } from '@/lib/supabase/client'; // Added to get current user

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

export default function CRMLeadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const showMyLeads = searchParams.get('my') === 'true';
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null);

  // Get current user ID for "My Leads" filter
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

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
    // 👇 FIX: Pass assigned_to filter if showMyLeads is true
    assigned_to: showMyLeads ? currentUserId : undefined, 
  });

  // Realtime updates
  useRealtimeLeads(undefined, {
    onNewLead: () => fetchLeads(),
    onLeadUpdate: () => fetchLeads(),
  });

  const columns = [
    {
      key: 'lead',
      header: 'Lead',
      render: (lead: any) => (
        <div>
          <p className="font-medium text-gray-900">{lead.full_name}</p>
          <p className="text-sm text-gray-500">{formatPhoneNumber(lead.phone)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: any) => (
        <LeadStatusBadge status={lead.status} />
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned To',
      render: (lead: any) => (
        <div>
          {/* 👇 FIX: Use .name instead of .user.full_name */}
          {lead.assigned_team_member ? (
            <p className="text-gray-900 font-medium">
              {lead.assigned_team_member.name || lead.assigned_team_member.email}
            </p>
          ) : (
            <span className="text-gray-400 italic text-sm">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (lead: any) => (
        <p className="text-xs text-gray-400">
          {formatRelativeTime(lead.created_at)}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lead: any) => (
        <div className="flex items-center gap-2">
           <Link
            href={`/admin/crm/leads/${lead.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${lead.phone}`, '_self');
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showMyLeads ? 'My Leads' : 'All Leads'}
          </h1>
          <p className="text-gray-600 mt-1">{total} total leads</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchLeads()}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/crm/leads/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Tabs for All vs My */}
      <div className="flex border-b">
        <button
          onClick={() => router.push('/admin/crm/leads')}
          className={`px-4 py-2 font-medium ${!showMyLeads ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
        >
          All Leads
        </button>
        <button
          onClick={() => router.push('/admin/crm/leads?my=true')}
          className={`px-4 py-2 font-medium ${showMyLeads ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
        >
          My Leads
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
            router.push(`/admin/crm/leads/${lead.id}`);
          }}
        />
      </div>
    </div>
  );
}