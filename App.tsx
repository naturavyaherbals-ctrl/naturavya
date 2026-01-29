'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { StatsCards, LeadTemperatureCards, AlertCards } from '@/components/dashboard/StatsCards';
import { StaffPerformanceTable } from '@/components/dashboard/StaffPerformance';
import { CampaignROITable } from '@/components/dashboard/CampaignROI';
import { LeakageDetector } from '@/components/dashboard/LeakageDetector';
import { RefillAutomation } from '@/components/dashboard/RefillAutomation';
import { LeadPipeline } from '@/components/leads/LeadPipeline';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { 
  MOCK_LEADS, 
  MOCK_ORDERS, 
  MOCK_CAMPAIGNS, 
  MOCK_STAFF_PERFORMANCE, 
  MOCK_LEAKAGE_POINTS,
  MOCK_DASHBOARD_STATS 
} from '@/data/mockData';
import type { Lead } from '@/types';

export function App() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'pipeline' | 'orders' | 'analytics' | 'settings'>('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-white font-bold text-lg">Naturavya</h1>
                <p className="text-indigo-300 text-xs">AI Sales OS</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', emoji: '📊' },
            { id: 'pipeline', icon: Users, label: 'Lead Pipeline', emoji: '🎯' },
            { id: 'orders', icon: ShoppingCart, label: 'Orders', emoji: '📦' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics', emoji: '📈' },
            { id: 'settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as typeof activeSection)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* AI Assistant Card */}
        {sidebarOpen && (
          <div className="p-4">
            <div className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-white font-semibold text-sm">AI Assistant</span>
              </div>
              <p className="text-indigo-200 text-xs">
                🤖 8 leads ko aaj follow-up karna hai!
              </p>
              <div className="mt-2 text-xs text-amber-300">
                3 hot leads ready for closing
              </div>
            </div>
          </div>
        )}

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-white/10 text-indigo-300 hover:text-white transition-colors flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeSection === 'dashboard' && '📊 AI-Powered Dashboard'}
                {activeSection === 'pipeline' && '🎯 Lead Pipeline'}
                {activeSection === 'orders' && '📦 Orders'}
                {activeSection === 'analytics' && '📈 Campaign Analytics'}
                {activeSection === 'settings' && '⚙️ Settings'}
              </h2>
              <p className="text-sm text-gray-500">
                Level 10 Sales Operating System - Powered by AI
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads, orders..."
                  className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* User */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <StatsCards stats={MOCK_DASHBOARD_STATS} />
              
              {/* Lead Temperature Cards */}
              <LeadTemperatureCards stats={MOCK_DASHBOARD_STATS} />
              
              {/* Alert Cards */}
              <AlertCards stats={MOCK_DASHBOARD_STATS} />

              {/* Main Dashboard Tabs */}
              <Tabs defaultValue="owner">
                <TabsList className="mb-4">
                  <TabsTrigger value="owner" icon={<AlertTriangle className="w-4 h-4" />}>
                    🚨 Owner Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="staff" icon={<Users className="w-4 h-4" />}>
                    👥 Staff Performance
                  </TabsTrigger>
                  <TabsTrigger value="roi" icon={<Target className="w-4 h-4" />}>
                    📊 Campaign ROI
                  </TabsTrigger>
                  <TabsTrigger value="refill" icon={<RefreshCw className="w-4 h-4" />}>
                    🔄 Refill Automation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="owner">
                  <LeakageDetector leakagePoints={MOCK_LEAKAGE_POINTS} />
                </TabsContent>

                <TabsContent value="staff">
                  <StaffPerformanceTable staff={MOCK_STAFF_PERFORMANCE} />
                </TabsContent>

                <TabsContent value="roi">
                  <CampaignROITable campaigns={MOCK_CAMPAIGNS} />
                </TabsContent>

                <TabsContent value="refill">
                  <RefillAutomation orders={MOCK_ORDERS} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeSection === 'pipeline' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{MOCK_LEADS.length}</span>
                  </div>
                  <p className="text-sm text-gray-500">Total Leads</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-2 text-red-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">{MOCK_LEADS.filter(l => l.temperature === 'hot').length}</span>
                  </div>
                  <p className="text-sm text-gray-500">🔥 Hot Leads</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-2 text-orange-600">
                    <Target className="w-5 h-5" />
                    <span className="font-semibold">{MOCK_LEADS.filter(l => l.temperature === 'warm').length}</span>
                  </div>
                  <p className="text-sm text-gray-500">🌡️ Warm Leads</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">{MOCK_LEADS.filter(l => l.status === 'order_confirmed').length}</span>
                  </div>
                  <p className="text-sm text-gray-500">✅ Converted</p>
                </div>
              </div>

              {/* Kanban Pipeline */}
              <div className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Visual Lead Pipeline
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Drag leads to change status</span>
                  </div>
                </div>
                <LeadPipeline 
                  leads={MOCK_LEADS} 
                  onLeadClick={(lead) => setSelectedLead(lead)}
                />
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">📦 Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Order #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">City</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {MOCK_ORDERS.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 font-medium text-indigo-600">{order.order_number}</td>
                          <td className="px-4 py-4">
                            <p className="font-medium">{order.shipping_name}</p>
                            <p className="text-sm text-gray-500">{order.shipping_phone}</p>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{order.shipping_city}</td>
                          <td className="px-4 py-4 text-right font-semibold">₹{order.total_amount.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                              order.status === 'ndr' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.payment_method === 'cod' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {order.payment_method.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <CampaignROITable campaigns={MOCK_CAMPAIGNS} />
              <StaffPerformanceTable staff={MOCK_STAFF_PERFORMANCE} />
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">⚙️ System Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">🤖 AI Automation</h4>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Auto WhatsApp for new leads</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-indigo-600" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">AI Lead Scoring</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-indigo-600" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Auto Follow-up Reminders</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-indigo-600" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Refill Automation</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-indigo-600" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">📱 WhatsApp Settings</h4>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800 font-medium">✅ WhatsApp Connected</p>
                      <p className="text-sm text-green-600">Phone: +91 98765 43210</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm text-gray-600 block mb-2">Auto-reply delay (seconds)</label>
                      <input type="number" defaultValue={30} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
