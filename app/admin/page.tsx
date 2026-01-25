'use client';

// =====================================================
// ADMIN DASHBOARD PAGE - SIMPLIFIED
// =====================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Phone,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Target,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalLeads: number;
  newLeadsToday: number;
  hotLeads: number;
  pendingFollowUps: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalLeads: 0,
    newLeadsToday: 0,
    hotLeads: 0,
    pendingFollowUps: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setStats({
          totalOrders: data.data.orders_total || 0,
          pendingOrders: data.data.pending_orders || 0,
          totalRevenue: data.data.revenue_total || 0,
          totalCustomers: data.data.customers_total || 0,
          totalLeads: data.data.leads_total || 0,
          newLeadsToday: data.data.leads_today || 0,
          hotLeads: data.data.hot_leads || 0,
          pendingFollowUps: data.data.pending_follow_ups || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your business overview.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          subtitle="Lifetime"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="blue"
          subtitle={`${stats.pendingOrders} pending`}
        />
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<Phone className="w-5 h-5" />}
          color="purple"
          subtitle={`${stats.newLeadsToday} new today`}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="w-5 h-5" />}
          color="orange"
          subtitle="Lifetime"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AlertCard
          title="Pending Orders"
          count={stats.pendingOrders}
          description="Orders waiting for processing"
          href="/admin/orders?status=pending"
          type="warning"
        />
        <AlertCard
          title="Hot Leads"
          count={stats.hotLeads}
          description="Ready to convert - Priority!"
          href="/admin/crm?status=hot_lead"
          type="danger"
        />
        <AlertCard
          title="Pending Follow-ups"
          count={stats.pendingFollowUps}
          description="Leads waiting for follow-up"
          href="/admin/crm?status=follow_up"
          type="info"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            href="/admin/orders"
            icon={<ShoppingCart className="w-6 h-6" />}
            title="View Orders"
            color="blue"
          />
          <QuickActionCard
            href="/admin/crm"
            icon={<Phone className="w-6 h-6" />}
            title="Manage Leads"
            color="purple"
          />
          <QuickActionCard
            href="/admin/products"
            icon={<Package className="w-6 h-6" />}
            title="Products"
            color="green"
          />
          <QuickActionCard
            href="/admin/customers"
            icon={<Users className="w-6 h-6" />}
            title="Customers"
            color="orange"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-green-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No recent orders</p>
            <p className="text-sm">Orders will appear here</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Leads</h2>
            <Link href="/admin/crm" className="text-sm text-green-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <Phone className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No recent leads</p>
            <p className="text-sm">Leads will appear here</p>
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
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'orange';
  subtitle: string;
}) {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function AlertCard({
  title,
  count,
  description,
  href,
  type,
}: {
  title: string;
  count: number;
  description: string;
  href: string;
  type: 'warning' | 'danger' | 'info';
}) {
  const colors = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
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
            <p className="font-medium">{title}</p>
            <p className="text-sm opacity-80">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{count}</p>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Link
      href={href}
      className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
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