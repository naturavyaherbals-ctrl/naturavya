'use client';

// =====================================================
// MANAGER DASHBOARD - TEAM MANAGEMENT VIEW
// =====================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Phone,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  PhoneCall,
} from 'lucide-react';
import type { TeamMember, TeamMemberStats, DashboardStats } from '@/types';

interface TeamMemberWithStats extends TeamMember {
  stats: TeamMemberStats;
}

export default function ManagerDashboard() {
  const { user, teamMember } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, teamRes] = await Promise.all([
        fetch('/api/admin/dashboard/manager-stats'),
        fetch('/api/admin/team?with_stats=true'),
      ]);

      const statsData = await statsRes.json();
      const teamData = await teamRes.json();

      if (statsData.success) setStats(statsData.data);
      if (teamData.success) setTeamMembers(teamData.data);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-500">Monitor your team's performance</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/team"
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Team
          </Link>
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Reports
          </Link>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Team Size"
          value={stats?.team_size || 0}
          change={null}
        />
        <StatCard
          icon={<Phone className="w-5 h-5" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Team Leads Today"
          value={stats?.team_leads_today || 0}
          change={12}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Team Conversions"
          value={stats?.team_conversions_today || 0}
          change={8}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Conversion Rate"
          value={`${stats?.conversion_rate || 0}%`}
          change={2.5}
        />
      </div>

      {/* Alerts Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <AlertCard
          type="warning"
          title="Pending Follow-ups"
          value={stats?.pending_follow_ups || 0}
          description="Leads waiting for follow-up"
          href="/admin/crm?status=follow_up"
        />
        <AlertCard
          type="danger"
          title="Hot Leads"
          value={stats?.hot_leads || 0}
          description="Ready to convert - Priority!"
          href="/admin/crm?status=hot_lead"
        />
        <AlertCard
          type="info"
          title="Pending Orders"
          value={stats?.pending_orders || 0}
          description="Orders awaiting confirmation"
          href="/admin/orders?status=pending"
        />
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Team Performance - Today</h2>
          <Link
            href="/admin/team"
            className="text-sm text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Team Member
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Leads Today
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Contacted
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Converted
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Conv. Rate
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Pending
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.user?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.user?.full_name}</p>
                        <p className="text-xs text-gray-500">{member.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      member.is_available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        member.is_available ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      {member.is_available ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {member.stats?.leads_assigned_today || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {member.stats?.leads_contacted || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-600 font-medium">
                      {member.stats?.leads_converted_today || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${
                      (member.stats?.conversion_rate || 0) >= 20 
                        ? 'text-green-600' 
                        : (member.stats?.conversion_rate || 0) >= 10 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {member.stats?.conversion_rate || 0}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${
                      (member.stats?.follow_up_pending || 0) > 10 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                    }`}>
                      {member.stats?.follow_up_pending || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/team/${member.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {teamMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          href="/admin/crm?assigned_to=unassigned"
          icon={<Phone className="w-6 h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          title="Unassigned Leads"
          description="Assign to team members"
        />
        <QuickActionCard
          href="/admin/crm?status=hot_lead"
          icon={<TrendingUp className="w-6 h-6" />}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          title="Hot Leads"
          description="Priority follow-up needed"
        />
        <QuickActionCard
          href="/admin/reports?type=team"
          icon={<BarChart3 className="w-6 h-6" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          title="Team Reports"
          description="View detailed analytics"
        />
        <QuickActionCard
          href="/admin/targets"
          icon={<Target className="w-6 h-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          title="Set Targets"
          description="Assign monthly targets"
        />
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
  change,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  change: number | null;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        {change !== null && (
          <span className={`flex items-center text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function AlertCard({
  type,
  title,
  value,
  description,
  href,
}: {
  type: 'warning' | 'danger' | 'info';
  title: string;
  value: number;
  description: string;
  href: string;
}) {
  const colors = {
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const iconColors = {
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <Link
      href={href}
      className={`block p-4 rounded-xl border ${colors[type]} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${iconColors[type]}`} />
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({
  href,
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:shadow-md transition-shadow"
    >
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-xl" />
    </div>
  );
}