'use client';

// =====================================================
// ADMIN DASHBOARD - FULL ADMIN VIEW
// =====================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Phone,
  Package,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  DollarSign,
  UserPlus,
  Target,
  Activity,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import type { DashboardStats, Order, Lead, TeamPerformanceReport } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [topPerformers, setTopPerformers] = useState<TeamPerformanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, leadsRes, performersRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/orders?limit=5'),
        fetch('/api/leads?limit=5'),
        fetch('/api/admin/team/top-performers?limit=5'),
      ]);

      const [statsData, ordersData, leadsData, performersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        leadsRes.json(),
        performersRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setRecentOrders(ordersData.data);
      if (leadsData.success) setRecentLeads(leadsData.data);
      if (performersData.success) setTopPerformers(performersData.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Complete business overview</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </Link>
          <Link
            href="/admin/settings"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Today's Revenue"
          value={formatCurrency(stats?.revenue_today || 0)}
          change={15.2}
          subtext={`${stats?.orders_today || 0} orders`}
        />
        <MetricCard
          icon={<ShoppingCart className="w-5 h-5" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Total Orders"
          value={stats?.orders_total || 0}
          change={8.1}
          subtext={`${stats?.pending_orders || 0} pending`}
        />
        <MetricCard
          icon={<Phone className="w-5 h-5" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Total Leads"
          value={stats?.leads_total || 0}
          change={12.5}
          subtext={`${stats?.leads_today || 0} today`}
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Total Customers"
          value={stats?.customers_total || 0}
          change={5.3}
          subtext="Lifetime"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallMetricCard
          label="Conversion Rate"
          value={`${stats?.conversion_rate || 0}%`}
          icon={<Target className="w-4 h-4" />}
          trend="up"
        />
        <SmallMetricCard
          label="Avg. Order Value"
          value={formatCurrency(stats?.avg_order_value || 0)}
          icon={<Activity className="w-4 h-4" />}
          trend="up"
        />
        <SmallMetricCard
          label="Hot Leads"
          value={stats?.hot_leads || 0}
          icon={<TrendingUp className="w-4 h-4" />}
          trend="neutral"
          highlight
        />
        <SmallMetricCard
          label="Pending Follow-ups"
          value={stats?.pending_follow_ups || 0}
          icon={<AlertTriangle className="w-4 h-4" />}
          trend="neutral"
          highlight
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary font-medium hover:underline">
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.shipping_first_name} {order.shipping_last_name}</p>
                      <p className="text-xs text-gray-500">{order.shipping_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Top Performers</h2>
            <Link href="/admin/team" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.team_member_id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <p className="text-xs text-gray-500">{performer.leads_converted} conversions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{performer.conversion_rate}%</p>
                  <p className="text-xs text-gray-500">{formatCurrency(performer.revenue)}</p>
                </div>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <p className="text-center text-gray-500 py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Leads</h2>
            <Link href="/admin/crm" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium">{lead.full_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getLeadStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">{lead.source.replace('_', ' ')}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/crm/${lead.id}`}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <p className="p-8 text-center text-gray-500">No leads yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <Package className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="font-medium">Add Product</p>
            </Link>
            <Link
              href="/admin/crm?action=new"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <UserPlus className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium">Add Lead</p>
            </Link>
            <Link
              href="/admin/team"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <Users className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="font-medium">Manage Team</p>
            </Link>
            <Link
              href="/admin/reports"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <BarChart3 className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="font-medium">View Reports</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function MetricCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  change,
  subtext,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  change: number;
  subtext: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <span className={`flex items-center text-sm font-medium ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
  );
}

function SmallMetricCard({
  label,
  value,
  icon,
  trend,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <span className="text-gray-500">{icon}</span>
        {trend !== 'neutral' && (
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    not_picked: 'bg-gray-100 text-gray-800',
    follow_up: 'bg-orange-100 text-orange-800',
    interested: 'bg-purple-100 text-purple-800',
    hot_lead: 'bg-red-100 text-red-800',
    order_confirmed: 'bg-green-100 text-green-800',
    converted: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
