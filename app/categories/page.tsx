export const dynamic = "force-dynamic"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { supabaseServer } from "@/lib/supabase/server"

export default async function CategoriesPage() {
  const supabase = await supabaseServer()

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) {
    console.error("Categories fetch error:", error)
  }

  return (
    <>
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>

        <ul className="grid gap-4">
          {categories?.map((category) => (
            <li
              key={category.id}
              className="p-4 border rounded-lg hover:shadow"
            >
              {category.name}
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </>
  )
}

}
