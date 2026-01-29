'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Phone,
  Target,
  UserPlus,
  AlertTriangle,
  Flame,
  Thermometer,
  Snowflake,
  ArrowRight,
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

interface StaffStats {
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
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/dashboard/staff', {
          credentials: 'include',
        });
        const json = await res.json();
        const data: StaffStats = json.data || json;
        setStats(data);
      } catch (err) {
        console.error('Staff dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const totalLeads = stats?.my_leads_total ?? 0;
  const leadsToday = stats?.my_new_leads_today ?? 0;
  const callsMade = stats?.my_completed_calls_today ?? stats?.my_calls_today ?? 0;
  const myConversions = stats?.my_conversions_today ?? 0;
  const myRevenueToday = stats?.my_revenue_today ?? 0;

  const conversionRate =
    totalLeads > 0 ? (myConversions / totalLeads) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Sales Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Aaj ke leads, follow-ups aur Naturavya sales performance ek jagah
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/crm/leads/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Top Stats – staff focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Total Leads"
          value={loading ? '...' : String(totalLeads)}
          icon={Users}
          iconClassName="bg-blue-600"
        />
        <StatsCard
          title="New Leads Today"
          value={loading ? '...' : String(leadsToday)}
          icon={UserPlus}
          iconClassName="bg-green-600"
        />
        <StatsCard
          title="Calls Completed Today"
          value={loading ? '...' : String(callsMade)}
          icon={Phone}
          iconClassName="bg-purple-600"
        />
        <StatsCard
          title="My Conversion Rate"
          value={
            loading ? '...' : `${conversionRate.toFixed(1)}%`
          }
          icon={Target}
          iconClassName="bg-orange-600"
        />
      </div>

      {/* AI Lead Temperature + Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Lead Temperature (MY leads) */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              AI Lead Temperature (My Leads)
            </h2>
            <Link
              href="/admin/crm/pipeline?my=true"
              className="text-green-600 text-sm hover:underline flex items-center"
            >
              Open My Pipeline <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-red-700 uppercase">
                  Hot Leads
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {loading ? '...' : stats?.my_hot_leads ?? 0}
                </p>
                <p className="text-xs text-red-600">
                  Sabse pehle inko call karo – close hone ka chance high hai
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-700 uppercase">
                  Warm Leads
                </p>
                <p className="text-2xl font-bold text-amber-800">
                  {loading ? '...' : stats?.my_warm_leads ?? 0}
                </p>
                <p className="text-xs text-amber-600">
                  WhatsApp + follow-up se nurture karo
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase">
                  Cold Leads
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {loading ? '...' : stats?.my_cold_leads ?? 0}
                </p>
                <p className="text-xs text-blue-600">
                  Abhi low priority – revival campaign me jayenge
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">
            My Follow‑up Health
          </h2>
          {loading ? (
            <div className="text-center text-gray-500 py-6 text-sm">
              Loading...
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Follow‑ups due today</span>
                <span className="font-semibold text-gray-900">
                  {stats?.my_followups_due_today ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Overdue follow‑ups
                </span>
                <span className="font-semibold text-red-600">
                  {stats?.my_followups_overdue ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Avg response time (mins)
                </span>
                <span className="font-semibold text-gray-900">
                  {stats?.my_avg_response_time_min ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Avg call duration (sec)
                </span>
                <span className="font-semibold text-gray-900">
                  {stats?.my_avg_call_duration_sec ?? 0}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Aaj ka simple goal: <b>saare overdue follow‑ups khatam karo</b>{' '}
                aur hot leads pe repeat calls/WhatsApp karo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* My Revenue + team / links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">My Revenue Today</h2>
            <Link
              href="/admin/orders?createdBy=me"
              className="text-green-600 text-sm hover:underline flex items-center"
            >
              View My Orders <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-8 text-sm">
              Loading...
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                ₹ {myRevenueToday.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">
                Orders jaha aap agent ho (`created_by_agent`). Iss ko daily
                target se compare karein.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Team / Global View
            </h2>
            <Link
              href="/admin"
              className="text-green-600 text-sm hover:underline flex items-center"
            >
              Open Admin Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="text-center text-gray-500 py-8 text-sm">
            For full company stats, use the main Admin Dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}