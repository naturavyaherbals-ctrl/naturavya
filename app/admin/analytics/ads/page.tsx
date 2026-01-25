'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MousePointer,
  Eye,
  Target,
  ShoppingCart,
  RefreshCw,
  Calendar,
  Settings,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/formatters';

interface AdAnalyticsData {
  accounts: any[];
  campaigns: any[];
  totals: {
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
    purchases: number;
    purchaseValue: number;
    reach: number;
    ctr: number;
    cpc: number;
    cpm: number;
    costPerLead: number;
    costPerPurchase: number;
    roas: number;
  };
  chartData: {
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
    purchases: number;
  }[];
  leadAttribution: {
    meta_ads: { total: number; converted: number };
    google_ads: { total: number; converted: number };
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function AdAnalyticsPage() {
  const [data, setData] = useState<AdAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [platform, setPlatform] = useState<'all' | 'meta' | 'google'>('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [platform, dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (platform !== 'all') params.set('platform', platform);
      params.set('startDate', dateRange.startDate);
      params.set('endDate', dateRange.endDate);

      const response = await fetch(`/api/admin/analytics/ads?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch ad analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      await fetch('/api/admin/analytics/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      fetchAnalytics();
    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color,
    subtitle,
    trend,
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    subtitle?: string;
    trend?: number;
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Safe access to arrays
  const campaigns = data?.campaigns || [];
  const chartData = data?.chartData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Analytics</h1>
          <p className="text-gray-600 mt-1">Track your Meta and Google Ads performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Data
          </button>
          <button
            onClick={() => setShowAccountModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Manage Accounts
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {['all', 'meta', 'google'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  platform === p
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'all' ? 'All Platforms' : p === 'meta' ? 'Meta Ads' : 'Google Ads'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {data ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Spend"
              value={formatCurrency(data.totals.spend)}
              icon={DollarSign}
              color="bg-red-500"
            />
            <StatCard
              title="Impressions"
              value={formatNumber(data.totals.impressions)}
              icon={Eye}
              color="bg-blue-500"
              subtitle={`${formatCurrency(data.totals.cpm)} CPM`}
            />
            <StatCard
              title="Clicks"
              value={formatNumber(data.totals.clicks)}
              icon={MousePointer}
              color="bg-purple-500"
              subtitle={`${formatPercentage(data.totals.ctr)} CTR • ${formatCurrency(data.totals.cpc)} CPC`}
            />
            <StatCard
              title="Leads Generated"
              value={data.totals.leads}
              icon={Users}
              color="bg-green-500"
              subtitle={`${formatCurrency(data.totals.costPerLead)} per lead`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Purchases"
              value={data.totals.purchases}
              icon={ShoppingCart}
              color="bg-emerald-500"
              subtitle={`${formatCurrency(data.totals.costPerPurchase)} per purchase`}
            />
            <StatCard
              title="Revenue"
              value={formatCurrency(data.totals.purchaseValue)}
              icon={TrendingUp}
              color="bg-green-600"
            />
            <StatCard
              title="ROAS"
              value={`${data.totals.roas.toFixed(2)}x`}
              icon={Target}
              color={data.totals.roas >= 1 ? 'bg-green-500' : 'bg-red-500'}
              subtitle={data.totals.roas >= 1 ? 'Profitable' : 'Below break-even'}
            />
            <StatCard
              title="Reach"
              value={formatNumber(data.totals.reach)}
              icon={Users}
              color="bg-indigo-500"
            />
          </div>

          {/* Lead Attribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Attribution</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Meta Ads</p>
                      <p className="text-sm text-gray-500">Facebook & Instagram</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{data.leadAttribution.meta_ads.total}</p>
                    <p className="text-sm text-green-600">
                      {data.leadAttribution.meta_ads.converted} converted
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Google Ads</p>
                      <p className="text-sm text-gray-500">Search & Display</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{data.leadAttribution.google_ads.total}</p>
                    <p className="text-sm text-green-600">
                      {data.leadAttribution.google_ads.converted} converted
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Campaigns</h2>
              {/* FIX: Use the safe campaigns array */}
              {campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{campaign.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{campaign.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(campaign.spend)}</p>
                        <p className="text-sm text-gray-500">{campaign.conversions} conv.</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No campaigns found</p>
              )}
            </div>
          </div>

          {/* Daily Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h2>
            {/* FIX: Use the safe chartData array */}
            {chartData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impressions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clicks</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spend</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Purchases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {chartData.map((day) => (
                      <tr key={day.date} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{day.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(day.impressions)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(day.clicks)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(day.spend)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{day.leads}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{day.purchases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No data for selected period</p>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No analytics data available</p>
          <p className="text-sm text-gray-400 mt-1">Connect your ad accounts to start tracking</p>
          <button
            onClick={() => setShowAccountModal(true)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Connect Ad Account
          </button>
        </div>
      )}

      {/* Account Management Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Ad Account Settings</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                To connect your ad accounts, you'll need to configure API access in your Meta Business Suite or Google Ads account.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">Meta Ads</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Connect your Facebook/Instagram ad accounts
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm w-full">
                    Connect Meta Ads
                  </button>
                </div>

                <div className="p-4 border rounded-lg hover:border-red-500 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">Google Ads</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Connect your Google Ads accounts
                  </p>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm w-full">
                    Connect Google Ads
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Note: Full integration requires API credentials. Contact support for setup assistance.
              </p>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setShowAccountModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}