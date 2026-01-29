'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Phone,
  Target,
  IndianRupee,
  Loader2,
  ArrowRight,
  Users,
  TrendingUp,
  Percent,
  PackageX,
} from 'lucide-react';

type StaffStats = {
  my_leads_total: number;
  my_new_leads_today: number;
  my_conversions_today: number;
  my_revenue_today: number;
  my_followups_due_today: number;
  my_followups_overdue: number;
  my_hot_leads: number;
  my_warm_leads: number;
  my_cold_leads: number;
  my_calls_today: number;
  my_completed_calls_today: number;
  my_avg_call_duration_sec: number;
  my_avg_response_time_min: number;
};

type AdminSummary = {
  company: {
    orders_last7: number;
    revenue_last7: number;
    rto_orders_last7: number;
    rto_rate_last7: number;
  };
  team_top_agents: {
    agent_id: string;
    agent_name: string;
    orders: number;
    revenue: number;
    rto_orders: number;
    rto_rate_pct: number;
  }[];
  ads_totals: {
    leads: number;
    orders: number;
    revenue: number;
    conv_rate: number;
  };
  rto_last30: {
    total_orders: number;
    rto_orders: number;
    rto_rate: number;
  };
  ai_suggestion: string | null;
};

export default function TodayPage() {
  const [role, setRole] = useState<string | null>(null);
  const [staffStats, setStaffStats] = useState<StaffStats | null>(null);
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/dashboard/today', {
          credentials: 'include',
        });
        const json = await res.json();
        setRole(json.data?.role || null);
        setStaffStats(json.data?.staffStats || null);
        setAdminSummary(json.data?.adminSummary || null);
      } catch (e) {
        console.error('My Day stats error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ========== AGENT / MANAGER VIEW ==========
  if (!loading && (role === 'agent' || role === 'manager')) {
    const s = staffStats;
    const conversionRate =
      s && s.my_leads_total > 0
        ? (s.my_conversions_today / s.my_leads_total) * 100
        : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Day – Today</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Aaj ka focus: hot leads, follow‑ups due & apni sales
            </p>
          </div>
          <Link
            href="/admin/crm/leads?my=true"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
          >
            <Phone className="w-4 h-4" />
            Open My Leads
          </Link>
        </div>

        {s ? (
          <>
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card
                title="New Leads Today"
                value={s.my_new_leads_today}
                icon={Phone}
                color="bg-blue-50 border-blue-200 text-blue-800"
              />
              <Card
                title="Hot Leads (Total)"
                value={s.my_hot_leads}
                icon={Flame}
                color="bg-red-50 border-red-200 text-red-800"
              />
              <Card
                title="Follow‑ups Due Today"
                value={s.my_followups_due_today}
                icon={Clock}
                color="bg-amber-50 border-amber-200 text-amber-800"
              />
              <Card
                title="My Revenue Today"
                value={`₹ ${s.my_revenue_today.toFixed(0)}`}
                icon={IndianRupee}
                color="bg-emerald-50 border-emerald-200 text-emerald-800"
              />
            </div>

            {/* Second row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                title="Calls Completed Today"
                value={s.my_completed_calls_today}
                icon={Phone}
                color="bg-purple-50 border-purple-200 text-purple-800"
                subtitle={`${s.my_calls_today} total calls`}
              />
              <Card
                title="Avg Response Time"
                value={`${s.my_avg_response_time_min.toFixed(1)} min`}
                icon={Clock}
                color="bg-sky-50 border-sky-200 text-sky-800"
                subtitle="Lower is better"
              />
              <Card
                title="Today Conv. Rate"
                value={`${conversionRate.toFixed(1)}%`}
                icon={Target}
                color="bg-gray-50 border-gray-200 text-gray-800"
                subtitle={`${s.my_conversions_today} conversions`}
              />
            </div>

            {/* Priority list */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Aaj kya karna hai?
              </h2>
              <ol className="list-decimal list-inside text-sm space-y-2 text-gray-800">
                <li>
                  <b>Saare overdue follow‑ups khatam karo:</b>{' '}
                  <span className="font-semibold text-red-600">
                    {s.my_followups_overdue}
                  </span>{' '}
                  pending.{' '}
                  <Link
                    href="/admin/crm/leads?my=true"
                    className="text-green-600 underline inline-flex items-center gap-1"
                  >
                    Open My Leads
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <b>Hot leads pe kaam:</b>{' '}
                  <span className="font-semibold text-red-600">
                    {s.my_hot_leads}
                  </span>{' '}
                  hot,{' '}
                  <span className="font-semibold text-amber-600">
                    {s.my_warm_leads}
                  </span>{' '}
                  warm. Start from top of score list.
                </li>
                <li>
                  <b>Calls & WhatsApp:</b> Aaj{' '}
                  <span className="font-semibold">
                    {s.my_completed_calls_today}/{s.my_calls_today}
                  </span>{' '}
                  calls complete. Target: at least{' '}
                  <span className="font-semibold">+10 more</span>.
                </li>
                <li>
                  <b>Revenue goal:</b> Today so far{' '}
                  <span className="font-semibold text-emerald-700">
                    ₹ {s.my_revenue_today.toFixed(0)}
                  </span>
                  . Dekho kitne orders aur close karne hain to apna target hit
                  ho.
                </li>
              </ol>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickLink
                title="My Hot & Warm Leads"
                description="Scorewise sorted list – pehle yahi call karo"
                href="/admin/crm/leads?my=true"
              />
              <QuickLink
                title="My Follow‑ups"
                description="Status = Follow Up, auto follow‑ups + manual calls"
                href="/admin/crm/leads?my=true"
              />
              <QuickLink
                title="My Orders Today"
                description="See orders where you are the agent"
                href="/admin/orders?createdBy=me"
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            No staff data found for this user.
          </p>
        )}
      </div>
    );
  }

  // ========== SUPER_ADMIN / ADMIN VIEW ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Naturavya – Today’s Company View
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Team performance, ads, RTO & AI growth suggestions
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : adminSummary ? (
        <>
          {/* Company summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              title="Orders (7d)"
              value={adminSummary.company.orders_last7}
              icon={TrendingUp}
              color="bg-blue-50 border-blue-200 text-blue-800"
            />
            <Card
              title="Revenue (7d)"
              value={`₹ ${adminSummary.company.revenue_last7.toLocaleString('en-IN')}`}
              icon={IndianRupee}
              color="bg-emerald-50 border-emerald-200 text-emerald-800"
            />
            <Card
              title="RTO Orders (7d)"
              value={adminSummary.company.rto_orders_last7}
              icon={PackageX}
              color="bg-red-50 border-red-200 text-red-800"
            />
            <Card
              title="RTO Rate (7d)"
              value={`${(adminSummary.company.rto_rate_last7 || 0).toFixed(2)}%`}
              icon={Percent}
              color="bg-amber-50 border-amber-200 text-amber-800"
            />
          </div>

          {/* Team leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Top Agents (7d)
            </h2>
            {adminSummary.team_top_agents.length === 0 ? (
              <p className="text-sm text-gray-500">No agent data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Agent</th>
                      <th className="px-3 py-2 text-right">Orders</th>
                      <th className="px-3 py-2 text-right">Revenue</th>
                      <th className="px-3 py-2 text-right">RTO</th>
                      <th className="px-3 py-2 text-right">RTO %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {adminSummary.team_top_agents.map((a) => (
                      <tr key={a.agent_id}>
                        <td className="px-3 py-2">{a.agent_name}</td>
                        <td className="px-3 py-2 text-right">{a.orders}</td>
                        <td className="px-3 py-2 text-right">
                          ₹ {a.revenue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 text-right">{a.rto_orders}</td>
                        <td className="px-3 py-2 text-right">
                          {a.rto_rate_pct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ads performance */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Ads Performance (7d)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card
                title="Leads"
                value={adminSummary.ads_totals.leads}
                icon={Phone}
                color="bg-blue-50 border-blue-200 text-blue-800"
              />
              <Card
                title="Orders"
                value={adminSummary.ads_totals.orders}
                icon={TrendingUp}
                color="bg-green-50 border-green-200 text-green-800"
              />
              <Card
                title="Revenue"
                value={`₹ ${adminSummary.ads_totals.revenue.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                color="bg-emerald-50 border-emerald-200 text-emerald-800"
              />
              <Card
                title="Conv. Rate"
                value={`${(adminSummary.ads_totals.conv_rate || 0).toFixed(2)}%`}
                icon={Percent}
                color="bg-amber-50 border-amber-200 text-amber-800"
              />
            </div>
          </div>

          {/* RTO summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PackageX className="w-5 h-5 text-red-600" />
              RTO (Last 30d)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                title="Total Orders"
                value={adminSummary.rto_last30.total_orders}
                icon={TrendingUp}
                color="bg-blue-50 border-blue-200 text-blue-800"
              />
              <Card
                title="RTO Orders"
                value={adminSummary.rto_last30.rto_orders}
                icon={PackageX}
                color="bg-red-50 border-red-200 text-red-800"
              />
              <Card
                title="RTO Rate"
                value={`${(adminSummary.rto_last30.rto_rate || 0).toFixed(2)}%`}
                icon={Percent}
                color="bg-amber-50 border-amber-200 text-amber-800"
              />
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-600" />
              AI Suggestions for Today
            </h2>
            {adminSummary.ai_suggestion ? (
              <div className="text-sm text-gray-800 whitespace-pre-line">
                {adminSummary.ai_suggestion}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No AI suggestions available (model busy or not configured).
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">
          No admin/company data found for this user.
        </p>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${color}`}>
      <div className="p-2 rounded-lg bg-white/50">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium opacity-80">{title}</p>
        <p className="text-xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-[11px] mt-0.5 opacity-80">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function QuickLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between hover:border-green-400 hover:shadow-md transition"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}