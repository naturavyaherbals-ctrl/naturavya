import { supabaseServer } from "@/app/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Pencil, Trash } from "lucide-react"

export default async function AdminCategoriesPage() {
  const supabase = await supabaseServer()
  
  // Fetch categories from DB
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("title", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link href="/admin/categories/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase border-b">
            <tr>
              <th className="px-6 py-3">Category Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => (
              <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{cat.title}</td>
                <td className="px-6 py-4 text-muted-foreground">{cat.slug}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/categories/${cat.id}`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                </td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}