'use client';

// =====================================================
// AGENT DASHBOARD - SALES AGENT VIEW
// =====================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Calendar,
  AlertCircle,
  ChevronRight,
  MessageCircle,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Lead, TeamMemberStats } from '@/types';

export default function AgentDashboard() {
  const { user, teamMember } = useAuth();
  const [stats, setStats] = useState<TeamMemberStats | null>(null);
  const [pendingLeads, setPendingLeads] = useState<Lead[]>([]);
  const [followUpLeads, setFollowUpLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch agent stats and leads
      const [statsRes, leadsRes] = await Promise.all([
        fetch('/api/admin/dashboard/agent-stats'),
        fetch('/api/leads?status=new,not_picked,follow_up&assigned_to=me&limit=10'),
      ]);

      const statsData = await statsRes.json();
      const leadsData = await leadsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (leadsData.success) {
        const leads = leadsData.data as Lead[];
        setPendingLeads(leads.filter(l => ['new', 'not_picked'].includes(l.status)));
        setFollowUpLeads(leads.filter(l => l.status === 'follow_up'));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
            <p className="text-white/80 mt-1">Here's your performance overview for today</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Today's Target</p>
            <p className="text-3xl font-bold">{stats?.leads_converted_today || 0}/{teamMember?.monthly_target ? Math.ceil(teamMember.monthly_target / 30) : 5}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Phone className="w-5 h-5" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Leads Today"
          value={stats?.leads_assigned_today || 0}
          subtext="Assigned to you"
        />
        <StatCard
          icon={<PhoneCall className="w-5 h-5" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Calls Made"
          value={stats?.leads_contacted || 0}
          subtext="Contacted today"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Conversions"
          value={stats?.leads_converted_today || 0}
          subtext="Orders confirmed"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Pending Follow-ups"
          value={stats?.follow_up_pending || 0}
          subtext="Need attention"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/crm?status=new"
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">New Leads</p>
            <p className="text-sm text-gray-500">Call fresh leads</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
        </Link>

        <Link
          href="/admin/crm?status=follow_up"
          className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Follow Ups</p>
            <p className="text-sm text-gray-500">Pending callbacks</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
        </Link>

        <Link
          href="/admin/crm?status=hot_lead"
          className="flex items-center gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Hot Leads</p>
            <p className="text-sm text-gray-500">Ready to convert</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
        </Link>

        <Link
          href="/admin/orders?status=pending"
          className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">My Orders</p>
            <p className="text-sm text-gray-500">View orders</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Leads - Priority */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold">Priority Leads</h2>
            </div>
            <Link
              href="/admin/crm?status=new,not_picked"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y">
            {pendingLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                <p>All caught up! No pending leads.</p>
              </div>
            ) : (
              pendingLeads.map((lead) => (
                <LeadQuickCard key={lead.id} lead={lead} />
              ))
            )}
          </div>
        </div>

        {/* Follow-up Leads */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold">Today's Follow-ups</h2>
            </div>
            <Link
              href="/admin/crm?status=follow_up"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y">
            {followUpLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No follow-ups scheduled for today.</p>
              </div>
            ) : (
              followUpLeads.map((lead) => (
                <LeadQuickCard key={lead.id} lead={lead} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold mb-4">Your Performance This Month</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.leads_assigned_total || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Converted</p>
            <p className="text-2xl font-bold text-green-600">{stats?.leads_converted_total || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-primary">{stats?.conversion_rate || 0}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenue Generated</p>
            <p className="text-2xl font-bold text-gray-900">₹{(stats?.revenue_total || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  subtext: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LeadQuickCard({ lead }: { lead: Lead }) {
  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{lead.full_name || 'Unknown'}</p>
            <p className="text-sm text-gray-500">{lead.phone}</p>
            {lead.city && (
              <p className="text-xs text-gray-400">📍 {lead.city}, {lead.state}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Call Button */}
          <a
            href={`tel:${lead.phone}`}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          {/* View Details */}
          <Link
            href={`/admin/crm/${lead.id}`}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="View Details"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      {/* Lead Meta */}
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <span className={`px-2 py-0.5 rounded-full ${getStatusColor(lead.status)}`}>
          {lead.status.replace('_', ' ')}
        </span>
        <span>via {lead.source.replace('_', ' ')}</span>
        <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</span>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    not_picked: 'bg-gray-100 text-gray-700',
    follow_up: 'bg-orange-100 text-orange-700',
    interested: 'bg-purple-100 text-purple-700',
    hot_lead: 'bg-red-100 text-red-700',
    order_confirmed: 'bg-green-100 text-green-700',
    converted: 'bg-green-100 text-green-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
