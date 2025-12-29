"use client"

import { useState } from "react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Star, ThumbsUp, ImageIcon, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

import type { Review } from "@/lib/reviews-data"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)

  const handleHelpful = () => {
    if (!isHelpful) {
      setIsHelpful(true)
      setHelpfulCount((prev) => prev + 1)
    }
  }

  const formattedDate = new Date(review.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // ✅ SAFE ARRAY (FIXES TS ERROR)
  const images = review.images ?? []

  return (
    <Card className="border-0 bg-card shadow-md hover:shadow-lg transition-all">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img
              src={review.avatar || "/placeholder.svg"}
              alt={review.customerName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{review.customerName}</h4>
              {review.verified && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {review.location}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < review.rating
                  ? "fill-accent text-accent"
                  : "fill-muted text-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <h5 className="font-semibold mb-2">{review.title}</h5>
        <p className="text-muted-foreground mb-4">{review.content}</p>

        {/* Images (✅ FIXED JSX) */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="w-20 h-20 rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Product link */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Product:</span>
          <Link
            href={`/products/${review.productSlug}`}
            className="text-sm text-primary font-medium hover:underline"
          >
            {review.productName}
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={handleHelpful}
            className={cn(
              "flex items-center gap-2 text-sm",
              isHelpful
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <ThumbsUp
              className={cn("w-4 h-4", isHelpful && "fill-primary")}
            />
            Helpful ({helpfulCount})
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
