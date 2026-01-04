import { supabaseServer } from "@/app/lib/supabase/server"
import Link from "next/link"

export default async function CategoriesPage() {
  const supabase = await supabaseServer()

  // 1. FIXED: Changed 'name' to 'title'
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("title")

  if (error) {
    console.error("Categories fetch error:", error)
  }

  return (
    <>

      <main className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Link 
              href={`/categories/${category.slug}`}
              key={category.id}
              className="group block relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg transition-all"
            >
              {/* Image Placeholder (since your DB might not have images yet) */}
              <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-105 transition-transform duration-500">
                {category.image ? (
                   <img src={category.image} alt={category.title} className="w-full h-full object-cover" />
                ) : (
                   <span>No Image</span>
                )}
              </div>
              
              <div className="p-6">
                {/* 2. FIXED: Changed 'category.name' to 'category.title' */}
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        
        {(!categories || categories.length === 0) && (
            <p className="text-center text-muted-foreground">No categories found.</p>
        )}
      </main>
    </>
  )
}