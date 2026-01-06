"use client"

import { useState, useEffect } from "react" // 👈 Added imports
import { motion } from "framer-motion"
import { Leaf } from "lucide-react"
import Link from "next/link"

// Components
import PromoSlider from "@/components/promo-slider"
import FeaturedProducts from "@/components/featured-products"
import IngredientsSection from "@/components/ingredients-section"
import TestimonialsCarousel from "@/components/testimonials-carousel"
import CTASection from "@/components/cta-section"
import WhatsAppButton from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"

/* Animation: Floating leaves background */
function FloatingLeavesBackground() {
  const [leaves, setLeaves] = useState<any[]>([])

  // Move randomness to useEffect (Client-side only)
  useEffect(() => {
    const generatedLeaves = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      initialX: Math.random() * 1400,
      initialY: -120,
      rotate: Math.random() * 360,
      duration: 22 + Math.random() * 12,
      fontSize: 24 + Math.random() * 28,
      delay: Math.random() * 5
    }))
    setLeaves(generatedLeaves)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-primary/20"
          initial={{
            y: leaf.initialY,
            x: leaf.initialX,
            rotate: leaf.rotate,
          }}
          animate={{
            y: "110vh",
            rotate: 360,
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            ease: "linear",
            delay: leaf.delay
          }}
          style={{ fontSize: leaf.fontSize }}
        >
          <Leaf />
        </motion.div>
      ))}
    </div>
  )
}

/* Animation: Soft bubbles */
function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<any[]>([])

  // Move randomness to useEffect (Client-side only)
  useEffect(() => {
    const generatedBubbles = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: 22 + Math.random() * 10,
      delay: Math.random() * 6
    }))
    setBubbles(generatedBubbles)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-primary/10 blur-xl"
          style={{
            width: 120,
            height: 120,
            left: bubble.left,
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: 1 }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: "linear",
            delay: bubble.delay,
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4">
        <FloatingLeavesBackground />
        <FloatingBubbles />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
        >
          
          {/* LEFT: Text Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
            <span className="inline-block mb-4 text-sm tracking-wider text-primary">
              AYURVEDIC WELLNESS FOR INDIA
            </span>

            <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6">
              Pure Ayurvedic Wellness by{" "}
              <span className="text-primary font-medium">Naturavya</span>
            </h1>

            <p className="max-w-2xl text-muted-foreground text-lg mb-10">
              India’s modern Ayurvedic wellness brand — crafted for strength,
              balance, vitality and intimate health using time-tested herbs and
              scientific precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/categories">
                <Button size="lg" className="rounded-full px-10 h-12 text-lg">
                  Shop Products
                </Button>
              </Link>

              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 h-12 text-lg"
                >
                  Our Ayurveda
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex justify-center order-1 lg:order-2"
          >
            <motion.img
              src="/hero-product.png"
              alt="Naturavya Ayurvedic Products"
              className="w-3/4 md:w-full max-w-md drop-shadow-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-medium mb-2">100% Ayurvedic</h3>
            <p className="text-muted-foreground">
              Rooted in authentic Indian Ayurveda and herbal wisdom.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Luxury Formulations</h3>
            <p className="text-muted-foreground">
              Premium quality ingredients, processed with precision.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Safe & Trusted</h3>
            <p className="text-muted-foreground">
              Designed for long-term wellness across all age groups.
            </p>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <PromoSlider />
      <FeaturedProducts />
      <IngredientsSection />
      <TestimonialsCarousel />
      <CTASection />
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
    </main>
  )
}
