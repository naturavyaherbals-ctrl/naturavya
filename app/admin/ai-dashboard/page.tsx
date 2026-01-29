'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Flame,
  Thermometer,
  Snowflake,
  TrendingUp,
  Users,
  Phone,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface DashboardData {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  todayConversions: number;
  conversionRate: number;
}

interface LeadWithAI {
  id: string;
  full_name: string;
  phone: string;
  temperature: string;
  score: number;
  ai_suggested_action: string;
  status: string;
  created_at: string;
}

export default function AIDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [hotLeads, setHotLeads] = useState<LeadWithAI[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('id, temperature, score, status, next_follow_up')
        .not('status', 'in', '("order_confirmed","cancelled","not_interested","wrong_number")');

      if (error) throw error;

      const totalLeads = leads?.length || 0;
      const hotLeadsCount = leads?.filter(l => l.temperature === 'hot').length || 0;
      const warmLeads = leads?.filter(l => l.temperature === 'warm').length || 0;
      const coldLeads = leads?.filter(l => l.temperature === 'cold').length || 0;
      const avgScore = leads?.length
        ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)
        : 0;

      const now = new Date();
      const pendingFollowUps =
        leads?.filter(l => l.next_follow_up && new Date(l.next_follow_up) > now).length || 0;
      const overdueFollowUps =
        leads?.filter(l => l.next_follow_up && new Date(l.next_follow_up) < now).length || 0;

      const today = new Date().toISOString().split('T')[0];
      const { data: conversions } = await supabase
        .from('leads')
        .select('id')
        .eq('status', 'order_confirmed')
        .gte('updated_at', today);

      const todayConversions = conversions?.length || 0;
      const conversionRate = totalLeads > 0 ? Math.round((todayConversions / totalLeads) * 100) : 0;

      setData({
        totalLeads,
        hotLeads: hotLeadsCount,
        warmLeads,
        coldLeads,
        avgScore,
        pendingFollowUps,
        overdueFollowUps,
        todayConversions,
        conversionRate,
      });

      const { data: hotLeadsData } = await supabase
        .from('leads')
        .select('id, full_name, phone, temperature, score, ai_suggested_action, status, created_at')
        .eq('temperature', 'hot')
        .not('status', 'in', '("order_confirmed","cancelled","not_interested","wrong_number")')
        .order('score', { ascending: false })
        .limit(10);

      setHotLeads(hotLeadsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            AI Sales Dashboard
          </h1>
          <p className="text-gray-500">Real-time AI-powered insights</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Temperature Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Hot Leads */}
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Hot Leads</p>
              <p className="text-4xl font-bold">{data.hotLeads}</p>
            </div>
            <Flame className="w-12 h-12 text-red-200" />
          </div>
          <p className="text-sm text-red-100 mt-2">🔥 Priority: Call immediately!</p>
        </div>

        {/* Warm Leads */}
        <div className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Warm Leads</p>
              <p className="text-4xl font-bold">{data.warmLeads}</p>
            </div>
            <Thermometer className="w-12 h-12 text-orange-200" />
          </div>
          <p className="text-sm text-orange-100 mt-2">📞 Follow up within 2 hours</p>
        </div>

        {/* Cold Leads */}
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Cold Leads</p>
              <p className="text-4xl font-bold">{data.coldLeads}</p>
            </div>
            <Snowflake className="w-12 h-12 text-blue-200" />
          </div>
          <p className="text-sm text-blue-100 mt-2">⏰ Schedule for later</p>
        </div>

        {/* Avg Score */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg Lead Score</p>
              <p className="text-4xl font-bold">{data.avgScore}/100</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200" />
          </div>
          <p className="text-sm text-purple-100 mt-2">📊 AI-calculated quality</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.overdueFollowUps > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Overdue Follow-ups!</h3>
              <p className="text-red-600">
                {data.overdueFollowUps} leads have overdue follow-ups. Contact them NOW!
              </p>
            </div>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-800">Today's Conversions</h3>
            <p className="text-green-600">
              {data.todayConversions} orders confirmed today ({data.conversionRate}% rate)
            </p>
          </div>
        </div>
      </div>

      {/* Hot Leads Priority List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-red-50">
          <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            🔥 Hot Leads - Call Now!
          </h2>
        </div>
        <div className="divide-y">
          {hotLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hot leads at the moment
            </div>
          ) : (
            hotLeads.map((lead) => (
              <div key={lead.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Flame className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lead.full_name}</p>
                    <p className="text-sm text-gray-500">{lead.phone}</p>
                    {lead.ai_suggested_action && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {lead.ai_suggested_action}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Score: {lead.score}
                  </span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
