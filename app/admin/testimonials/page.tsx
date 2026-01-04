import { supabaseServer } from "@/app/lib/supabase/server"

export default async function AdminTestimonialsPage() {
  const supabase = await supabaseServer()
  const { data: testimonials } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Testimonials</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials?.map((t: any) => (
          <div key={t.id} className="p-6 border rounded-lg bg-card shadow-sm">
            <p className="italic text-muted-foreground mb-4">"{t.message}"</p>
            <div className="font-semibold text-right">- {t.name}</div>
            <div className="text-xs text-right text-muted-foreground">{t.role || "Customer"}</div>
          </div>
        ))}
         {(!testimonials || testimonials.length === 0) && (
           <p className="text-muted-foreground">No testimonials found.</p>
        )}
      </div>
    </div>
  )
}