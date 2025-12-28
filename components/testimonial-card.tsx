"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Testimonial } from "@/lib/reviews-data"

interface TestimonialCardProps {
  testimonial: Testimonial
  featured?: boolean
}

export function TestimonialCard({ testimonial, featured = false }: TestimonialCardProps) {
  const formattedDate = new Date(testimonial.date).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <Card
      className={cn(
        "border-0 bg-card shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group",
        featured && "lg:col-span-2",
      )}
    >
      <CardContent className={cn("p-8", featured && "lg:flex lg:gap-8")}>
        {/* Quote Icon */}
        <div
          className={cn(
            "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 flex-shrink-0",
            featured && "lg:mb-0",
          )}
        >
          <Quote className="w-8 h-8 text-primary" />
        </div>

        <div className="flex-1">
          {/* Featured Badge */}
          {featured && <Badge className="bg-accent text-accent-foreground mb-4">Featured Story</Badge>}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-5 h-5",
                  i < testimonial.rating ? "fill-accent text-accent" : "fill-muted text-muted-foreground/30",
                )}
              />
            ))}
          </div>

          {/* Story */}
          <p
            className={cn(
              "text-card-foreground leading-relaxed mb-6 font-light italic",
              featured ? "text-xl" : "text-base",
            )}
          >
            {`"${testimonial.story}"`}
          </p>

          {/* Video Thumbnail */}
          {testimonial.videoUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-6">
              <img src="/video-testimonial-thumbnail.png" alt="Video testimonial" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Before/After Images */}
          {testimonial.beforeImage && testimonial.afterImage && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={testimonial.beforeImage || "/placeholder.svg"}
                  alt="Before"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-foreground/80 text-background text-xs rounded">
                  Before
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={testimonial.afterImage || "/placeholder.svg"}
                  alt="After"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                  After
                </div>
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-4 pt-6 border-t border-border">
            <div className="w-14 h-14 rounded-full overflow-hidden">
              <img
                src={testimonial.avatar || "/placeholder.svg"}
                alt={testimonial.customerName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-card-foreground">{testimonial.customerName}</div>
              <div className="text-sm text-muted-foreground">{testimonial.location}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Product Used</div>
              <div className="text-sm text-primary font-medium">{testimonial.productUsed}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
