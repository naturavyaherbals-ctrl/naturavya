'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Phone,
  Eye,
  UserPlus,
  Search,
  RefreshCw,
  Flame,
  TrendingUp,
  RotateCcw,
  Loader2,
  Download,
} from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { useLeads } from '@/lib/hooks/useLeads';
import { useRealtimeLeads } from '@/lib/hooks/useRealtime';
import { formatRelativeTime, formatPhoneNumber } from '@/lib/utils/formatters';
import { LeadStatus, LeadSource } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

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
  { value: 'website' as LeadSource, label: 'Website' },
  { value: 'meta_ads' as LeadSource, label: 'Meta Ads' },
  { value: 'google_ads' as LeadSource, label: 'Google Ads' },
  { value: 'whatsapp' as LeadSource, label: 'WhatsApp' },
];

function getScoreBadgeClasses(temperature?: string | null) {
  const t = (temperature || '').toLowerCase();
  if (t === 'hot') return 'bg-red-100 text-red-700 border border-red-200';
  if (t === 'warm') return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (t === 'cold') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
}

function getTemperatureStripClass(temperature?: string | null) {
  const t = (temperature || '').toLowerCase();
  if (t === 'hot') return 'bg-red-500';
  if (t === 'warm') return 'bg-amber-400';
  if (t === 'cold') return 'bg-blue-400';
  return 'bg-gray-300';
}

type AdsTotals = {
  leads: number;
  converted_leads: number;
  orders: number;
  revenue_total: number;
  rto_orders: number;
  rto_revenue_lost: number;
  overall_conv_pct: number;
};

export default function CRMLeadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const showMyLeads = searchParams.get('my') === 'true';
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('');
  const [sort, setSort] = useState<string>('score_desc');

  // Ads / UTM performance
  const [adsTotals, setAdsTotals] = useState<AdsTotals | null>(null);
  const [adsLoading, setAdsLoading] = useState<boolean>(true);

  // Dead lead revival
  const [reviveLoading, setReviveLoading] = useState(false);
  const [reviveMessage, setReviveMessage] = useState<string | null>(null);

  // Auto follow-ups
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupMessage, setFollowupMessage] = useState<string | null>(null);

  // Export
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, [supabase]);

  // Fetch Meta/ads performance for last 7 days
  useEffect(() => {
    const fetchAdsSummary = async () => {
      try {
        setAdsLoading(true);
        const now = new Date();
        const end = now.toISOString().slice(0, 10);
        const startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        const start = startDate.toISOString().slice(0, 10);

        const res = await fetch(
          `/api/admin/ads/summary?start_date=${start}&end_date=${end}`
        );
        if (!res.ok) {
          console.error('Ads summary error status:', res.status);
          setAdsTotals(null);
          return;
        }
        const data = await res.json();
        if (data.success && data.totals) {
          setAdsTotals(data.totals);
        } else {
          setAdsTotals(null);
        }
      } catch (e) {
        console.error('Ads summary fetch error:', e);
        setAdsTotals(null);
      } finally {
        setAdsLoading(false);
      }
    };

    fetchAdsSummary();
  }, []);

  const { leads, total, page, totalPages, isLoading, fetchLeads } = useLeads({
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    search: search || undefined,
    assigned_to: showMyLeads ? currentUserId : undefined,
    temperature: temperatureFilter || undefined,
    sort,
  });

  useRealtimeLeads(undefined, {
    onNewLead: () => fetchLeads(),
    onLeadUpdate: () => fetchLeads(),
  });

  const handleRevive = async () => {
    const ok = window.confirm(
      'Dead leads (not_interested / cancelled / wrong_number / not_picked / lost) ke liye WhatsApp revival campaign bhejna hai?'
    );
    if (!ok) return;

    setReviveLoading(true);
    setReviveMessage(null);

    try {
      const res = await fetch('/api/admin/leads/revive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 30 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('Revive error:', data);
        setReviveMessage(
          'Revival failed. Thodi der baad dobara try karo.'
        );
      } else {
        setReviveMessage(
          `Revival sent to ${data.successCount}/${data.processed} leads. Failed: ${data.failCount}.`
        );
      }
    } catch (e) {
      console.error(e);
      setReviveMessage('Revival failed. Network issue aaya.');
    } finally {
      setReviveLoading(false);
    }
  };

  const handleProcessFollowups = async () => {
    setFollowupLoading(true);
    setFollowupMessage(null);

    try {
      const res = await fetch('/api/admin/followups/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('Followups process error:', data);
        setFollowupMessage(
          'Auto follow-ups run nahi ho paye. Thodi der baad dubara try karo.'
        );
      } else {
        setFollowupMessage(
          `Auto follow-ups: processed ${data.processed}, sent ${data.successCount}, failed ${data.failCount}.`
        );
      }
    } catch (e) {
      console.error(e);
      setFollowupMessage(
        'Auto follow-ups failed (network issue). Thodi der baad try karo.'
      );
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      if (temperatureFilter) params.set('temperature', temperatureFilter);
      if (search) params.set('search', search);
      if (showMyLeads && currentUserId) {
        params.set('assigned_to', currentUserId);
      }
      const url = `/api/admin/leads/export?${params.toString()}`;
      window.open(url, '_blank');
    } finally {
      setExportLoading(false);
    }
  };

  const columns = [
    {
      key: 'lead',
      header: 'Lead',
      render: (lead: any) => (
        <div className="flex items-center gap-3">
          <span
            className={`w-1.5 h-10 rounded-full ${getTemperatureStripClass(
              lead.temperature
            )}`}
          />
          <div>
            <p className="font-medium text-gray-900">{lead.full_name}</p>
            <p className="text-sm text-gray-500">
              {formatPhoneNumber(lead.phone)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (lead: any) => (
        <div className="text-xs">
          <p className="font-medium text-gray-800 capitalize">
            {lead.source || 'unknown'}
          </p>
          <p className="text-[11px] text-gray-500 truncate max-w-[160px]">
            {lead.campaign_name || lead.source_campaign || 'No campaign'}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: any) => <LeadStatusBadge status={lead.status} />,
    },
    {
      key: 'score',
      header: (
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-red-500" />
          <span>Score</span>
        </div>
      ),
      render: (lead: any) => (
        <div className="text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${getScoreBadgeClasses(
              lead.temperature
            )}`}
          >
            <span>{lead.score ?? '-'}</span>
            {lead.temperature && (
              <span className="uppercase text-[10px] tracking-wide">
                {String(lead.temperature)}
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned To',
      render: (lead: any) => (
        <div>
          {lead.assigned_team_member ? (
            <p className="text-gray-900 font-medium">
              {lead.assigned_team_member.name ||
                lead.assigned_team_member.email}
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRevive}
            disabled={reviveLoading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-orange-300 text-orange-700 rounded-lg bg-orange-50 hover:bg-orange-100 disabled:opacity-60 text-xs font-semibold"
          >
            {reviveLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Reviving...
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3" />
                Revive Dead Leads
              </>
            )}
          </button>

          <button
            onClick={handleProcessFollowups}
            disabled={followupLoading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-green-300 text-green-700 rounded-lg bg-green-50 hover:bg-green-100 disabled:opacity-60 text-xs font-semibold"
          >
            {followupLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Running Auto Follow-ups...
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3" />
                Run Auto Follow-ups
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-60 text-xs font-semibold"
          >
            {exportLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                Export CSV
              </>
            )}
          </button>

          <button
            onClick={() => fetchLeads()}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
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

      {(reviveMessage || followupMessage) && (
        <div className="space-y-2">
          {reviveMessage && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs px-3 py-2 rounded-lg">
              {reviveMessage}
            </div>
          )}
          {followupMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-2 rounded-lg">
              {followupMessage}
            </div>
          )}
        </div>
      )}

      {/* Ads / UTM Performance Bar */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
            <TrendingUp className="w-4 h-4" />
          </div>
        <div>
            <p className="text-xs font-semibold text-sky-800 uppercase tracking-wide">
              Meta / Campaign Performance (Last 7 days)
            </p>
            <p className="text-[11px] text-sky-700">
              Leads → Orders, revenue & RTO from all tracked campaigns.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          {adsLoading && !adsTotals ? (
            <span className="text-sky-700">Loading performance…</span>
          ) : adsTotals ? (
            <>
              <div className="px-2.5 py-1 rounded-full bg-white border border-sky-100 text-sky-800">
                Leads: <span className="font-semibold">{adsTotals.leads}</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white border border-sky-100 text-sky-800">
                Orders:{' '}
                <span className="font-semibold">{adsTotals.orders}</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white border border-sky-100 text-sky-800">
                Conv:{' '}
                <span className="font-semibold">
                  {adsTotals.overall_conv_pct.toFixed(1)}%
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white border border-sky-100 text-sky-800">
                Rev ₹{' '}
                <span className="font-semibold">
                  {adsTotals.revenue_total.toFixed(0)}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white border border-rose-100 text-rose-700">
                RTO:{' '}
                <span className="font-semibold">
                  {adsTotals.rto_orders} orders / ₹
                  {adsTotals.rto_revenue_lost.toFixed(0)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-sky-700">No ads data yet.</span>
          )}
        </div>
      </div>

      {/* Tabs for All vs My */}
      <div className="flex border-b">
        <button
          onClick={() => router.push('/admin/crm/leads')}
          className={`px-4 py-2 font-medium ${
            !showMyLeads
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500'
          }`}
        >
          All Leads
        </button>
        <button
          onClick={() => router.push('/admin/crm/leads?my=true')}
          className={`px-4 py-2 font-medium ${
            showMyLeads
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500'
          }`}
        >
          My Leads
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[260px]">
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

        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value as LeadSource | '')
          }
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          {LEAD_SOURCES.map((src) => (
            <option key={src.value} value={src.value}>
              {src.label}
            </option>
          ))}
        </select>

        <select
          value={temperatureFilter}
          onChange={(e) => setTemperatureFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">All Temps</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="score_desc">Score: High → Low</option>
          <option value="created_desc">Newest First</option>
          <option value="created_asc">Oldest First</option>
          <option value="priority_desc">Priority: High → Low</option>
          <option value="priority_asc">Priority: Low → High</option>
          <option value="score_asc">Score: Low → High</option>
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