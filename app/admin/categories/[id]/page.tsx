import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/app/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import EditCategoryForm from "./edit-form" // Import the client form

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (!category) {
    return notFound()
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Category</h1>
      </div>

      {/* 👇 Render the Client Form and pass data */}
      <EditCategoryForm category={category} />
      
    </div>
  )
}