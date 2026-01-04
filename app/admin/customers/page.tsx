import { supabaseServer } from "@/app/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default async function AdminCustomersPage() {
  const supabase = await supabaseServer()
  
  // Try to fetch customers. If table doesn't exist yet, it returns null/error which we catch.
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .catch(() => ({ data: [] })) 

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      {/* Tip for you: You need to create a 'customers' table in Supabase! */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers?.map((customer: any) => (
          <Card key={customer.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarFallback>{customer.full_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{customer.full_name || "Unknown"}</CardTitle>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Joined: {new Date(customer.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!customers || customers.length === 0) && (
           <p className="text-muted-foreground col-span-3">No customers found (or table missing).</p>
        )}
      </div>
    </div>
  )
}
