"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Wellness Enthusiast",
    message:
      "Naturavya products completely transformed my daily routine. Pure, authentic, and effective!",
  },
  {
    name: "Rahul Mehta",
    role: "Fitness Coach",
    message:
      "I recommend Naturavya to my clients. The quality and results are unmatched.",
  },
  {
    name: "Pooja Verma",
    role: "Ayurveda Believer",
    message:
      "Finally a brand that respects Ayurveda while maintaining premium quality.",
  },
]

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const testimonial = testimonials[index]

  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Loved by Thousands
        </h2>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-5 h-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-muted/40 rounded-2xl p-10 shadow-sm transition-all duration-500">
          <p className="text-lg text-foreground mb-6 leading-relaxed">
            “{testimonial.message}”
          </p>

          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {testimonial.name}
            </span>{" "}
            — {testimonial.role}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

