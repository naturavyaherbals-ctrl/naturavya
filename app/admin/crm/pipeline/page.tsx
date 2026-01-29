'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Flame,
  Phone,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime, formatPhoneNumber } from '@/lib/utils/formatters';

type Lead = any;

const PIPELINE_COLUMNS = [
  { id: 'new', label: 'New' },
  { id: 'not_picked', label: 'Not Picked' },
  { id: 'follow_up', label: 'Follow Up' },
  { id: 'interested', label: 'Interested' },
  { id: 'order_confirmed', label: 'Converted' },
  { id: 'cancelled', label: 'Cancelled' },
];

function getTemperatureStripClass(temperature?: string | null) {
  const t = (temperature || '').toLowerCase();
  if (t === 'hot') return 'bg-red-500';
  if (t === 'warm') return 'bg-amber-400';
  if (t === 'cold') return 'bg-blue-400';
  return 'bg-gray-300';
}

function getScoreBadgeClasses(temperature?: string | null) {
  const t = (temperature || '').toLowerCase();
  if (t === 'hot') return 'bg-red-100 text-red-700 border border-red-200';
  if (t === 'warm') return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (t === 'cold') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
}

type ColumnState = {
  leads: Lead[];
  total: number;
  loading: boolean;
};

export default function PipelinePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const showMy = searchParams.get('my') === 'true';
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [columns, setColumns] = useState<Record<string, ColumnState>>(() => {
    const base: Record<string, ColumnState> = {};
    PIPELINE_COLUMNS.forEach((c) => {
      base[c.id] = { leads: [], total: 0, loading: true };
    });
    return base;
  });
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    getUser();
  }, [supabase]);

  const loadPipeline = async () => {
    setGlobalLoading(true);
    setColumns((prev) => {
      const copy: typeof prev = { ...prev };
      PIPELINE_COLUMNS.forEach((c) => {
        copy[c.id] = { ...copy[c.id], loading: true };
      });
      return copy;
    });

    try {
      await Promise.all(
        PIPELINE_COLUMNS.map(async (col) => {
          const params = new URLSearchParams();
          params.set('status', col.id);
          params.set('page', '1');
          params.set('limit', '30');
          params.set('sort', 'score_desc');
          if (showMy && currentUserId) {
            params.set('assigned_to', currentUserId);
          }

          const res = await fetch(`/api/admin/leads?${params.toString()}`);
          if (!res.ok) {
            console.error('Pipeline column error', col.id, await res.text());
            setColumns((prev) => ({
              ...prev,
              [col.id]: { ...prev[col.id], loading: false },
            }));
            return;
          }

          const data = await res.json();
          setColumns((prev) => ({
            ...prev,
            [col.id]: {
              leads: data.data || [],
              total: data.pagination?.total || 0,
              loading: false,
            },
          }));
        })
      );
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    // load once user known (for "My pipeline")
    if (showMy && !currentUserId) return;
    loadPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMy, currentUserId]);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 text-sm">
            Visual view of leads by status. Drag-and-drop not enabled yet; use
            status update from lead detail page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/admin/crm/pipeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
              !showMy
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            All Pipeline
          </button>
          <button
            onClick={() => router.push('/admin/crm/pipeline?my=true')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
              showMy
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            My Pipeline
          </button>
          <button
            onClick={loadPipeline}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${globalLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Pipeline columns */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_COLUMNS.map((col) => {
            const state = columns[col.id];
            const loading = state?.loading;
            const leads = state?.leads || [];
            const total = state?.total || 0;

            return (
              <div
                key={col.id}
                className="w-72 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col max-h-[80vh]"
              >
                <div className="px-3 py-2 border-b flex items-center justify-between bg-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {col.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {total} leads
                    </span>
                  </div>
                  {loading && (
                    <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {leads.length === 0 && !loading && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No leads in this stage
                    </p>
                  )}
                  {leads.map((lead: any) => (
                    <Link
                      key={lead.id}
                      href={`/admin/crm/leads/${lead.id}`}
                      className="block bg-white rounded-xl border border-gray-200 px-3 py-2 hover:border-green-400 hover:shadow-sm transition"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 w-1 h-8 rounded-full ${getTemperatureStripClass(
                            lead.temperature
                          )}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {lead.full_name || 'Unnamed'}
                            </p>
                            {typeof lead.score === 'number' && (
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${getScoreBadgeClasses(
                                  lead.temperature
                                )}`}
                              >
                                <Flame className="w-3 h-3" />
                                {lead.score}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatPhoneNumber(lead.phone)}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(lead.created_at)}
                            </span>
                            {lead.assigned_team_member?.name && (
                              <span className="truncate max-w-[110px]">
                                {lead.assigned_team_member.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[11px] text-gray-400 flex items-center gap-1">
        <ArrowRight className="w-3 h-3" />
        Update status from lead detail page to move cards between stages.
      </div>
    </div>
  );
}