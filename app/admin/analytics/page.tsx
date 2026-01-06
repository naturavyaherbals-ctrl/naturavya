'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, ShoppingBag, Users, IndianRupee, Calendar } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('All Time')
  
  // Data State
  const [kpi, setKpi] = useState({ revenue: 0, orders: 0, customers: 0, aov: 0 })
  const [salesData, setSalesData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])

  // Colors for Charts
  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6B7280']

  // --- 2. FETCH & PROCESS DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true })

      if (error || !orders) {
        console.error('Error fetching analytics:', error)
        setLoading(false)
        return
      }

      // --- A. CALCULATE KPIS ---
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const totalOrders = orders.length
      // Count unique emails
      const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

      setKpi({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: uniqueCustomers,
        aov: avgOrderValue
      })

      // --- B. PREPARE SALES CHART (Group by Date) ---
      // Map: "2024-01-15" -> 5000 (Revenue)
      const salesMap: Record<string, number> = {}
      orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        salesMap[date] = (salesMap[date] || 0) + (order.total_amount || 0)
      })
      // Convert Map to Array for Recharts
      const chartData = Object.keys(salesMap).map(date => ({
        date,
        sales: salesMap[date]
      }))
      setSalesData(chartData)

      // --- C. PREPARE TOP PRODUCTS ---
      const productCounts: Record<string, number> = {}
      orders.forEach(order => {
        let items = []
        try {
          // Handle both array and string JSON formats safely
          items = Array.isArray(order.products) ? order.products : JSON.parse(order.products || '[]')
        } catch (e) { items = [] }

        items.forEach((item: string) => {
          productCounts[item] = (productCounts[item] || 0) + 1
        })
      })
      // Sort and take Top 5
      const topProductsData = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
      setTopProducts(topProductsData)

      // --- D. PREPARE STATUS DISTRIBUTION ---
      const statusCounts: Record<string, number> = {}
      orders.forEach(order => {
        const status = order.status || 'Unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })
      const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      setStatusData(statusChartData)

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time overview of your business performance</p>
        </div>
        <div className="bg-white border rounded-lg p-1 flex items-center">
          <Calendar size={16} className="ml-3 text-gray-400" />
          <select 
            className="p-2 text-sm bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Processing data...</div>
      ) : (
        <div className="space-y-8">
          
          {/* 1. KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Revenue" 
              value={`₹${kpi.revenue.toLocaleString()}`} 
              icon={<IndianRupee size={24} className="text-green-600" />} 
              bg="bg-green-50"
              trend="+12% vs last month"
            />
            <StatsCard 
              title="Total Orders" 
              value={kpi.orders} 
              icon={<ShoppingBag size={24} className="text-blue-600" />} 
              bg="bg-blue-50"
              trend="+5 new today"
            />
            <StatsCard 
              title="Customers" 
              value={kpi.customers} 
              icon={<Users size={24} className="text-orange-600" />} 
              bg="bg-orange-50"
              trend="Growing steadily"
            />
            <StatsCard 
              title="Avg. Order Value" 
              value={`₹${kpi.aov.toLocaleString()}`} 
              icon={<TrendingUp size={24} className="text-purple-600" />} 
              bg="bg-purple-50"
              trend="Stable"
            />
          </div>

          {/* 2. MAIN CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Trend (Takes up 2 columns) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">Sales Trend</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Distribution (Takes up 1 column) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">Order Status</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. TOP PRODUCTS BAR CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6">Top Selling Products</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// Simple Sub-Component for KPI Cards
function StatsCard({ title, value, icon, bg, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
        <p className="text-xs text-green-600 font-medium bg-green-50 inline-block px-2 py-1 rounded">{trend}</p>
      </div>
      <div className={`p-3 rounded-full ${bg}`}>
        {icon}
      </div>
    </div>
  )
}