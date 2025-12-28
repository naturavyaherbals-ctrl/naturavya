"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const slides = [
  {
    title: "Flat 20% Off on Herbal Oils",
    description: "Revitalize your body with our best-selling Ayurvedic oils.",
    cta: "Shop Oils",
    href: "/categories/intimate-oils",
    bg: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Wellness Combos Starting ₹999",
    description: "Complete herbal care packages curated for daily wellness.",
    cta: "Explore Combos",
    href: "/categories/supplements",
    bg: "from-amber-500/20 to-orange-500/20",
  },
  {
    title: "Pure • Natural • Ayurvedic",
    description: "Rooted in ancient wisdom, crafted for modern life.",
    cta: "Learn More",
    href: "/about",
    bg: "from-teal-500/20 to-cyan-500/20",
  },
]

export default function PromoSlider() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const slide = slides[active]

  return (
    <section className="relative py-16">
      <div
        className={`max-w-7xl mx-auto px-6 py-14 rounded-3xl bg-gradient-to-r ${slide.bg} transition-all duration-700`}
      >
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {slide.title}
          </h2>

          <p className="text-muted-foreground text-lg mb-8">
            {slide.description}
          </p>

          <Button size="lg" asChild>
            <Link href={slide.href}>{slide.cta}</Link>
          </Button>
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 w-10 rounded-full transition-all ${
                active === i ? "bg-primary" : "bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
