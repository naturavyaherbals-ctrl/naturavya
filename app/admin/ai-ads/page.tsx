'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  PauseCircle,
  Settings,
  PlayCircle,
  ShieldAlert,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type AiAdDecision = {
  ad_id: string;
  adset_id: string;
  campaign: string;
  product: string;
  action: 'scale' | 'pause' | 'optimize';
  reason: string[];
  suggested_budget_change: number;
  confidence: number;
  current_budget?: number;
};

export default function AiAdsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [decisions, setDecisions] = useState<AiAdDecision[]>([]);
  const [executingAd, setExecutingAd] = useState<string | null>(null);

  /* ===============================
     ROLE CHECK + DATA LOAD
  ================================ */
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: member, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || member?.role !== 'superadmin') {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);

      try {
        const res = await fetch('/api/ai/meta-ads');
        const json = await res.json();
        setDecisions(json.decisions || []);
      } catch (e) {
        console.error('Failed to load AI ads data', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, supabase]);

  /* ===============================
     EXECUTE META BUDGET
  ================================ */
  const executeBudget = async (row: AiAdDecision) => {
    setExecutingAd(row.ad_id);

    const currentBudget = row.current_budget || 1000;

    let suggestedBudget = currentBudget;
    if (row.action === 'scale') {
      suggestedBudget = Math.round(currentBudget * 1.3);
    } else if (row.action === 'pause') {
      suggestedBudget = 0;
    } else if (row.action === 'optimize') {
      suggestedBudget = Math.round(currentBudget * 0.8);
    }

    try {
      const res = await fetch('/api/admin/meta/execute-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: row.ad_id,
          adset_id: row.adset_id,
          action: row.action,
          current_budget: currentBudget,
          suggested_budget: suggestedBudget,
          campaign_name: row.campaign,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }

      alert('✅ Meta Ads budget updated successfully');
    } catch (e: any) {
      console.error(e);
      alert('❌ Failed to execute budget update');
    } finally {
      setExecutingAd(null);
    }
  };

  /* ===============================
     STATES
  ================================ */
  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-500">
        Loading AI Ads…
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          This page is available only for Superadmin.
        </p>
      </div>
    );
  }

  /* ===============================
     UI
  ================================ */
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        AI Ads Control Panel
      </h1>

      {decisions.length === 0 && (
        <p className="text-sm text-gray-500">
          No AI decisions available yet. Once Meta leads & spend
          sync is active, recommendations will appear here.
        </p>
      )}

      {decisions.map((d, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="font-bold text-lg">
                {d.campaign}
              </p>
              <p className="text-sm text-gray-500">
                Product: {d.product}
              </p>
            </div>

            <div className="flex items-center gap-2 font-bold uppercase">
              {d.action === 'scale' && (
                <TrendingUp className="text-green-600" />
              )}
              {d.action === 'pause' && (
                <PauseCircle className="text-red-600" />
              )}
              {d.action === 'optimize' && (
                <Settings className="text-amber-600" />
              )}
              <span>{d.action}</span>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              {d.reason.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <span>
              Suggested budget change:{' '}
              <strong>
                {d.suggested_budget_change}%
              </strong>
            </span>
            <span>
              Confidence:{' '}
              <strong>{d.confidence}%</strong>
            </span>
          </div>

          <button
            disabled={executingAd === d.ad_id}
            onClick={() => executeBudget(d)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-sm font-bold disabled:opacity-60"
          >
            <PlayCircle size={16} />
            {executingAd === d.ad_id
              ? 'Executing…'
              : 'Approve & Execute'}
          </button>
        </div>
      ))}
    </div>
  );
}
