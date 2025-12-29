import Link from "next/link"
import { supabaseServer } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
  const supabase = supabaseServer()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <table className="w-full border rounded">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-3">{p.name}</td>
              <td className="p-3">₹{p.price}</td>
              <td className="p-3 text-right">
                <Button size="sm" asChild variant="outline">
                  <Link href={`/admin/products/${p.id}`}>
                    Edit
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
