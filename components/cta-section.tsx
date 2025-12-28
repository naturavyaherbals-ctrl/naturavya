"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Begin Your Natural Wellness Journey
        </h2>

        <p className="text-lg mb-10 opacity-90 max-w-2xl mx-auto">
          Discover premium Ayurvedic products crafted with care, tradition, and
          modern science.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full px-10"
          >
            <Link href="/categories">Shop Now</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full px-10 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

