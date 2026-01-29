import { Card } from '@/components/ui/Card';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Flame,
  ThermometerSun,
  Snowflake
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Leads Today */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            +12%
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-900">{stats.leads_today}</p>
        <p className="text-sm text-gray-500">Aaj ke Leads</p>
      </Card>

      {/* Orders Today */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-green-100 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            +8%
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-900">{stats.orders_today}</p>
        <p className="text-sm text-gray-500">Aaj ke Orders</p>
      </Card>

      {/* Revenue Today */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-900">
          ₹{stats.revenue_today.toLocaleString('en-IN')}
        </p>
        <p className="text-sm text-gray-500">Aaj ki Revenue</p>
      </Card>

      {/* Conversion Rate */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-900">{stats.conversion_rate}%</p>
        <p className="text-sm text-gray-500">Conversion Rate</p>
      </Card>
    </div>
  );
}

export function LeadTemperatureCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {/* Hot Leads */}
      <Card className="p-4 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Flame className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.hot_leads}</p>
            <p className="text-sm text-gray-600">🔥 Hot Leads</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-red-600 font-medium">
          Turant call karo - ready to buy!
        </p>
      </Card>

      {/* Warm Leads */}
      <Card className="p-4 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ThermometerSun className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{stats.warm_leads}</p>
            <p className="text-sm text-gray-600">🌡️ Warm Leads</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-orange-600 font-medium">
          Regular follow-up needed
        </p>
      </Card>

      {/* Cold Leads */}
      <Card className="p-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Snowflake className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.cold_leads}</p>
            <p className="text-sm text-gray-600">❄️ Cold Leads</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-blue-600 font-medium">
          Re-engagement needed
        </p>
      </Card>
    </div>
  );
}

export function AlertCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {/* Pending Follow-ups */}
      <Card className="p-4 border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending_follow_ups}</p>
            <p className="text-sm text-gray-600">Pending Follow-ups</p>
          </div>
        </div>
      </Card>

      {/* Overdue Follow-ups */}
      <Card className="p-4 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.overdue_follow_ups}</p>
            <p className="text-sm text-gray-600">⚠️ Overdue! Turant action lo</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
