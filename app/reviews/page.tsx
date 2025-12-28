"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import { ReviewCard } from "@/components/review-card"
import { reviews } from "@/lib/reviews-data"
import { Star, Filter, SlidersHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function ReviewsPage() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredReviews = reviews.filter((review) => {
    const matchesRating = selectedRating === null || review.rating === selectedRating
    const matchesSearch =
      searchQuery === "" ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesRating && matchesSearch
  })

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1)

  const totalReviews = reviews.length

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length
    return {
      rating,
      count,
      percentage: (count / totalReviews) * 100,
    }
  })

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-6">
            Customer <span className="text-primary font-medium">Reviews</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Authentic experiences from customers on their wellness journey with Naturavya.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Overall */}
          <div className="p-6 bg-card rounded-2xl shadow-sm flex gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{averageRating}</div>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < Math.round(Number(averageRating))
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {totalReviews} reviews
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {ratingDistribution.map((item) => (
                <button
                  key={item.rating}
                  onClick={() =>
                    setSelectedRating(
                      selectedRating === item.rating ? null : item.rating
                    )
                  }
                  className={cn(
                    "w-full flex items-center gap-3 p-1 rounded",
                    selectedRating === item.rating ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <span className="w-10 flex items-center gap-1">
                    {item.rating}
                    <Star className="w-3 h-3 fill-accent text-accent" />
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-muted-foreground">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-6 bg-card rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-4">Find Reviews</h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={selectedRating === null ? "default" : "outline"}
                onClick={() => setSelectedRating(null)}
              >
                All
              </Button>

              {[5, 4, 3].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={selectedRating === r ? "default" : "outline"}
                  onClick={() => setSelectedRating(r)}
                >
                  {r} <Star className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {filteredReviews.length ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Filter className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reviews found</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
