"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Leaf } from "lucide-react"
import Link from "next/link"
import SeoSchema from "@/components/seo-schema"
import FAQSchema from "@/components/faq-schema"


/* Floating leaves background */
function FloatingLeavesBackground() {
  const [leaves, setLeaves] = useState<any[]>([])

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
          initial={{ y: leaf.initialY, x: leaf.initialX, rotate: leaf.rotate }}
          animate={{ y: "110vh", rotate: 360 }}
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

/* Floating bubbles */
function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<any[]>([])

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
          style={{ width: 120, height: 120, left: bubble.left }}
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

      {/* ✅ SEO SCHEMA (CRITICAL) */}
      <SeoSchema />
      <FAQSchema />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-24 px-4">
        <FloatingLeavesBackground />
        <FloatingBubbles />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
        >

          {/* LEFT: SEO + LOCAL CONTENT */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
            <span className="inline-block mb-4 text-sm tracking-wider text-primary">
              TRUSTED AYURVEDIC WELLNESS BRAND IN INDIA
            </span>

            <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6">
              Ayurvedic Sexual Wellness & Vitality Solutions by{" "}
              <span className="text-primary font-medium">Naturavya</span>
            </h1>

            <p className="max-w-2xl text-muted-foreground text-lg mb-6">
              Naturavya Herbals is a premium Indian Ayurvedic wellness brand
              offering natural solutions for male sexual wellness, stamina,
              vitality, joint comfort, and digestive balance. Our formulations
              are inspired by classical Ayurveda and developed for modern Indian
              lifestyles using carefully selected herbal ingredients.
            </p>

            <p className="max-w-2xl text-muted-foreground text-lg mb-6">
              Serving customers across India, Naturavya focuses on long-term
              wellness rather than instant results. Our products are commonly
              chosen by individuals looking for Ayurvedic support for male
              performance, confidence, energy levels, piles care, and muscle
              comfort — without harmful chemicals or synthetic compounds.
            </p>

            <p className="max-w-2xl text-muted-foreground text-lg mb-10">
              Our Ayurvedic range includes <strong>Virya+ Capsules</strong> for
              stamina and vitality, <strong>VStiff Gel</strong> for performance
              support, <strong>MaxBoom Capsules & Gel</strong> for strength and
              endurance, <strong>NullPile Capsules</strong> for piles wellness,
              and <strong>ZeroAche Oil</strong> for joint and muscle comfort.
              All products are crafted with safety, consistency, and customer
              trust at the core.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/categories">
                <Button size="lg" className="rounded-full px-10 h-12 text-lg">
                  Shop Ayurvedic Products
                </Button>
              </Link>

              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 h-12 text-lg"
                >
                  Learn About Our Ayurveda
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex justify-center order-1 lg:order-2"
          >
            <motion.img
              src="/hero-product.png"
              alt="Naturavya Ayurvedic Wellness Products in India"
              className="w-3/4 md:w-full max-w-md drop-shadow-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ================= TRUST & LOCAL EEAT ================= */}
      <section className="py-20 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h2 className="text-xl font-medium mb-2">
              Authentic Indian Ayurveda
            </h2>
            <p className="text-muted-foreground">
              Developed using traditional Ayurvedic knowledge combined with
              modern quality standards, ensuring purity and consistency.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium mb-2">
              Premium Herbal Ingredients
            </h2>
            <p className="text-muted-foreground">
              High-quality herbs sourced and processed to support male wellness,
              vitality, digestive balance, and physical comfort naturally.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium mb-2">
              Trusted by Customers Across India
            </h2>
            <p className="text-muted-foreground">
              Naturavya is chosen by individuals nationwide who prefer natural,
              Ayurvedic alternatives for everyday wellness and long-term health
              support.
            </p>
          </div>
        </div>
      </section>

      {/* EXISTING SECTIONS */}
      <PromoSlider />
      <FeaturedProducts />
      <IngredientsSection />
      <TestimonialsCarousel />
      <CTASection />

      <WhatsAppButton />
    </main>
  )
}


