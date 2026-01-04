import { supabaseServer } from "@/app/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, Plus } from "lucide-react"

export default async function AdminPromotionsPage() {
  const supabase = await supabaseServer()
  const { data: promotions } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Promotions</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Create Coupon</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promotions?.map((promo) => (
          <div key={promo.id} className="p-6 border rounded-xl bg-card hover:shadow-md transition flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="font-mono font-bold text-lg">{promo.code}</span>
              </div>
              <p className="text-sm text-muted-foreground">{promo.discount}% Off</p>
            </div>
            <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
              {promo.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}