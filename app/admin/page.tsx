import { supabaseServer } from "@/app/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await supabaseServer()

  // 1. Fetch REAL counts from your database tables
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })
  const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true })
  const { count: categoriesCount } = await supabase.from("categories").select("*", { count: "exact", head: true })
  const { count: customersCount } = await supabase.from("customers").select("*", { count: "exact", head: true })

  // 2. Calculate Total Revenue (Sum of all orders)
  const { data: orders } = await supabase.from("orders").select("total_amount")
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{ordersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total orders placed</p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        {/* Customers (Uses the count we fetched) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{customersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}