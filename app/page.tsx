"use client"

import { motion } from "framer-motion"
import { Leaf } from "lucide-react"

import Navbar from "@/components/navbar"
import PromoSlider from "@/components/promo-slider"
import FeaturedProducts from "@/components/featured-products"
import IngredientsSection from "@/components/ingredients-section"
import TestimonialsCarousel from "@/components/testimonials-carousel"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import FloatingLeaves from "@/components/floating-leaves"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/* Floating leaves background */
function FloatingLeavesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/20"
          initial={{
            y: -120,
            x: Math.random() * 1400,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: "110vh",
            rotate: 360,
          }}
          transition={{
            duration: 22 + Math.random() * 12,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ fontSize: 24 + Math.random() * 28 }}
        >
          <Leaf />
        </motion.div>
      ))}
    </div>
  )
}

/* Soft bubbles */
function FloatingBubbles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 blur-xl"
          style={{
            width: 120,
            height: 120,
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: 1 }}
          transition={{
            duration: 22 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 6,
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4">
        <FloatingLeaves />
        <FloatingBubbles />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* LEFT */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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
              <Button size="lg" className="rounded-full px-10">
                Shop Products
              </Button>

              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10"
                >
                  Our Ayurveda
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:flex justify-center"
          >
            <motion.img
              src="/hero-product.png"
              alt="Naturavya Ayurvedic Products"
              className="max-w-md drop-shadow-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Section */}
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

      {/* LONG BRAND CONTENT SECTION */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto space-y-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-light">
            Naturavya — Redefining Ayurvedic Wellness in India
          </h2>

          <p className="text-muted-foreground leading-relaxed">
            Naturavya is a modern Indian Ayurvedic wellness brand created for
            people who seek natural, effective and trustworthy solutions for
            everyday health concerns. Inspired by centuries-old Ayurvedic
            principles and refined with modern research, Naturavya bridges the
            gap between tradition and contemporary lifestyles.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            Our formulations are developed using carefully selected herbs such
            as Ashwagandha, Shilajit, Guggul, Safed Musli and other potent
            botanicals known in Ayurveda for rejuvenation, strength and balance.
            Each product is crafted with a focus on purity, safety and visible
            results — without harsh chemicals or shortcuts.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            From intimate wellness to joint care, from vitality enhancement to
            overall body balance, Naturavya addresses wellness holistically. We
            believe true health is not just about curing symptoms, but about
            restoring harmony within the body and mind.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            Proudly designed for the Indian market, Naturavya understands local
            needs, climates, lifestyles and expectations. Our mission is to
            offer premium Ayurvedic solutions that feel luxurious, perform
            effectively and earn long-term trust.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            Naturavya is not just a product line — it is a promise of purity,
            authenticity and wellness rooted in India’s timeless Ayurvedic
            heritage.
          </p>
        </div>
      </section>

      <PromoSlider />
      <FeaturedProducts />
      <IngredientsSection />
      <TestimonialsCarousel />
      <CTASection />

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
