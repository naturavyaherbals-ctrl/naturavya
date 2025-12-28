"use client"

export const dynamic = "force-dynamic";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
} from "lucide-react"

const metrics = [
  {
    title: "Total Revenue",
    value: "Rs. 4,52,890",
    change: "+12.5%",
    trend: "up",
    icon: IndianRupee,
    chartData: [40, 45, 35, 50, 55, 60, 70, 65, 75, 80, 85, 90],
  },
  {
    title: "Orders",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    chartData: [30, 35, 40, 38, 42, 48, 52, 55, 50, 58, 62, 65],
  },
  {
    title: "Customers",
    value: "2,847",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    chartData: [20, 25, 30, 35, 40, 42, 48, 55, 60, 68, 75, 82],
  },
  {
    title: "Page Views",
    value: "45,678",
    change: "-3.2%",
    trend: "down",
    icon: Eye,
    chartData: [90, 85, 88, 82, 78, 80, 75, 72, 70, 68, 65, 63],
  },
]

const topProducts = [
  { name: "VitaMax Pro", revenue: "Rs. 5,84,166", orders: 234, growth: "+18%", trend: "up" },
  { name: "SheBalance", revenue: "Rs. 3,58,911", orders: 189, growth: "+12%", trend: "up" },
  { name: "Shilajit Gold", revenue: "Rs. 4,25,858", orders: 142, growth: "+8%", trend: "up" },
  { name: "Ashwagandha Plus", revenue: "Rs. 1,55,844", orders: 156, growth: "-2%", trend: "down" },
  { name: "Energy Booster", revenue: "Rs. 1,46,902", orders: 98, growth: "+5%", trend: "up" },
]

const trafficSources = [
  { source: "Organic Search", visitors: 12450, percentage: 42, color: "bg-primary" },
  { source: "Direct", visitors: 8320, percentage: 28, color: "bg-blue-500" },
  { source: "Social Media", visitors: 5940, percentage: 20, color: "bg-amber-500" },
  { source: "Referral", visitors: 2970, percentage: 10, color: "bg-purple-500" },
]

const recentActivity = [
  { event: "New order placed", details: "Order #1235 - Rs. 2,499", time: "2 min ago" },
  { event: "Product review submitted", details: "VitaMax Pro - 5 stars", time: "15 min ago" },
  { event: "New customer registered", details: "priya@example.com", time: "32 min ago" },
  { event: "Order shipped", details: "Order #1230 - Tracking added", time: "1 hour ago" },
  { event: "Inventory low alert", details: "Ashwagandha Plus - 5 units left", time: "2 hours ago" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your store performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
              {/* Mini sparkline chart */}
              <div className="mt-4 flex h-12 items-end gap-1">
                {metric.chartData.map((value, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${metric.trend === "up" ? "bg-primary/60" : "bg-destructive/60"}`}
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{product.name}</span>
                      <span className="font-medium">{product.revenue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{product.orders} orders</span>
                      <span
                        className={`flex items-center gap-1 ${product.trend === "up" ? "text-green-500" : "text-red-500"}`}
                      >
                        {product.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {product.growth}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{source.source}</span>
                    <span className="text-muted-foreground">
                      {source.visitors.toLocaleString()} ({source.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${source.color}`} style={{ width: `${source.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events from your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.event}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}