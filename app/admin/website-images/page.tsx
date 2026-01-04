import { supabaseServer } from "@/app/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default async function WebsiteImagesPage() {
  const supabase = await supabaseServer()
  const { data: images } = await supabase.from("website_images").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Website Media</h1>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Image</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images?.map((img) => (
          <div key={img.id} className="group relative aspect-square border rounded-lg overflow-hidden bg-muted">
            <img src={img.image_url} alt={img.title || "Website Image"} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white text-xs font-medium px-2 py-1 border border-white rounded">{img.section}</span>
            </div>
          </div>
        ))}
        {(!images || images.length === 0) && <p className="col-span-4 text-center text-muted-foreground py-10">No images uploaded yet.</p>}
      </div>
    </div>
  )
}