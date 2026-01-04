import { supabaseServer } from "@/app/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export default async function AdminReviewsPage() {
  const supabase = await supabaseServer()
  const { data: reviews } = await supabase.from("reviews").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product Reviews</h1>
      <div className="border rounded-lg bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted uppercase border-b">
            <tr>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Comment</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews?.map((review: any) => (
              <tr key={review.id} className="border-b hover:bg-muted/50">
                <td className="px-6 py-4 flex text-yellow-500">
                  {Array(review.rating).fill(0).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </td>
                <td className="px-6 py-4 font-medium">{review.user_name || "Anonymous"}</td>
                <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{review.comment}</td>
                <td className="px-6 py-4"><Badge variant="outline">{review.status || "Pending"}</Badge></td>
              </tr>
            ))}
            {(!reviews || reviews.length === 0) && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No reviews yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}