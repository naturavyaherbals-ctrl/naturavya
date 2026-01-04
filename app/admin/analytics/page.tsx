import { supabaseServer } from "@/app/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AnalyticsPage() {
  const supabase = await supabaseServer()
  
  // Fetch raw data
  const { data: orders } = await supabase.from("orders").select("total_amount, status")
  
  // Calculate Stats
  const totalRevenue = orders?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0
  const avgOrderValue = orders?.length ? (totalRevenue / orders.length).toFixed(0) : 0
  const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Performance Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{avgOrderValue}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Conversion Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">2.4%</div><p className="text-xs text-muted-foreground">Industry avg: 1.8%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Delivered Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{deliveredOrders}</div></CardContent>
        </Card>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h3 className="font-semibold mb-4">Top Selling Categories</h3>
        <div className="space-y-4">
           {/* Dummy visual bars for now */}
           <div className="space-y-1">
             <div className="flex justify-between text-sm"><span>Men's Wellness</span><span>70%</span></div>
             <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[70%]"></div></div>
           </div>
           <div className="space-y-1">
             <div className="flex justify-between text-sm"><span>Joint Pain Relief</span><span>20%</span></div>
             <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[20%]"></div></div>
           </div>
        </div>
      </div>
    </div>
  )
}