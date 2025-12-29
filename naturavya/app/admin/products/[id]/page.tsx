import { supabaseServer } from "@/lib/supabase/server"
import EditProductForm from "./edit-form"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = supabaseServer()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !product) {
    return <div>Product not found</div>
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <EditProductForm product={product} />
    </div>
  )
}
