"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />

      {/* Animated Circles */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow"
        style={{
          transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse-glow"
        style={{
          transform: `translate(${-mousePosition.x * 2}px, ${-mousePosition.y * 2}px)`,
          animationDelay: "2s",
        }}
      />

      {/* Floating 3D Elements */}
      <div
        className="absolute top-32 left-20 opacity-60 animate-float"
        style={{
          transform: `translate(${mousePosition.x * 3}px, ${mousePosition.y * 3}px)`,
        }}
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/10 flex items-center justify-center shadow-xl">
          <Leaf className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div
        className="absolute bottom-40 left-32 opacity-60 animate-float-slow"
        style={{
          transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
          animationDelay: "1s",
        }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/5 backdrop-blur-sm border border-accent/20 flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-accent" />
        </div>
      </div>

      <div
        className="absolute top-48 right-24 opacity-50 animate-float"
        style={{
          transform: `translate(${-mousePosition.x * 4}px, ${-mousePosition.y * 4}px)`,
          animationDelay: "0.5s",
        }}
      >
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-secondary/40 to-secondary/10 backdrop-blur-sm border border-secondary/20 shadow-lg" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Leaf className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">100% Natural Ayurvedic</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 text-foreground">
          <span className="block">Pure Ayurvedic</span>
          <span className="block mt-2 text-primary font-medium">Intimacy & Wellness</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover the ancient wisdom of Ayurveda, crafted with premium natural ingredients for your holistic health and
          intimate wellness journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="px-8 py-6 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
            asChild
          >
            <Link href="/categories">
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg rounded-full border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-transparent"
            asChild
          >
            <Link href="/about">Our Story</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto">
          {[
            { value: "50+", label: "Products" },
            { value: "10K+", label: "Happy Customers" },
            { value: "100%", label: "Natural" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-semibold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}

