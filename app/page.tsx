"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Leaf, Star, ShieldCheck, MapPin, Phone } from "lucide-react" // Added icons
import Link from "next/link"
import SeoSchema from "@/components/seo-schema"
import FAQSchema from "@/components/faq-schema"
import { Button } from "@/components/ui/button"

// Components
import PromoSlider from "@/components/promo-slider"
import FeaturedProducts from "@/components/featured-products"
import IngredientsSection from "@/components/ingredients-section"
import TestimonialsCarousel from "@/components/testimonials-carousel"
import CTASection from "@/components/cta-section"
import WhatsAppButton from "@/components/whatsapp-button"

/* -------------------------------------------------------------------------- */
/* 1. SEO CONTENT COMPONENT (CRITICAL FOR GOOGLE RANKING)                     */
/* -------------------------------------------------------------------------- */
function SeoContent() {
  return (
    <section className="py-20 px-4 bg-stone-50 text-gray-800 border-t border-stone-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Main Brand Intro */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary tracking-tight">
            Naturavya – Premium Ayurvedic & Herbal Wellness in Indore
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Welcome to <strong>Naturavya</strong>, India’s trusted destination for 100% safe, 
            Ayurvedic, and herbal solutions. Based in <strong>Indore (Bada Ganpati)</strong>, 
            we specialize in formulating premium wellness products that combine ancient Vedic 
            wisdom with modern science. Our mission is simple: to provide effective natural 
            remedies <strong>without any side effects</strong>.
          </p>
        </div>

        {/* Product Specific SEO Keywords */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-primary flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Maxx Boom (Capsules & Gel)
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our best-selling <strong>Ayurvedic breast enhancement formula</strong>. Maxx Boom uses natural herbs to promote firmness and toning. A 100% safe, non-surgical solution for women seeking confidence without chemicals.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-primary flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Virya Plus (Men's Wellness)
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Reclaim your energy with <strong>Virya Plus</strong>. Formulated for men's vitality and stamina, this herbal supplement helps overcome weakness and improves physical performance using pure Shilajit and Ashwagandha.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-primary flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Zero Ache (Pain Relief Oil)
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The best natural remedy for <strong>joint pain, arthritis, and back pain</strong>. Zero Ache oil penetrates deep into muscles to provide fast, long-lasting relief. A must-have for elderly care in Indore.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-primary flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              V-Stiff & Null Pile
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Specialized care for intimate health. <strong>V-Stiff</strong> gel restores elasticity naturally, while <strong>Null Pile</strong> offers gentle, herbal relief from piles and fissures without surgery.
            </p>
          </div>
        </div>

        {/* Local Business Trust Signals */}
        <div className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-3">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h4 className="font-bold text-lg">100% Safe & Ayurvedic</h4>
              <p className="text-sm text-muted-foreground">Certified herbal ingredients. Zero side effects guaranteed.</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <MapPin className="w-10 h-10 text-primary" />
              <h4 className="font-bold text-lg">Indore Based</h4>
              <p className="text-sm text-muted-foreground">403-B, Gulab Bagh Colony, Indore, MP 452010.</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <Phone className="w-10 h-10 text-primary" />
              <h4 className="font-bold text-lg">Expert Support</h4>
              <p className="text-sm text-muted-foreground">Call us anytime for guidance: <br/><strong>+91 7222959340</strong></p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. ANIMATIONS                                                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* 3. MAIN HOMEPAGE                                                           */
/* -------------------------------------------------------------------------- */

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
              stamina and vitality, <strong>VStiff Gel</strong> for Vaginal Tightness,
              <strong>MaxBoom Capsules & Gel</strong> for increasing Boobs Size and 
              Curves, <strong>NullPile Capsules</strong> for piles wellness,
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

          {/* RIGHT: IMAGE - ✅ ALT TEXT TRICK APPLIED BELOW */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex justify-center order-1 lg:order-2"
          >
            <motion.img
              src="/hero-product.png"
              // 👇 This is the Step 4 "Alt Text Trick" - DO NOT CHANGE THIS LINE
              alt="Naturavya Herbals - Maxx Boom Breast Enhancement and Virya Plus Vitality Capsules Indore"
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
      
      {/* ✅ ADDED THE SEO CONTENT COMPONENT HERE */}
      <SeoContent />

      <TestimonialsCarousel />
      <CTASection />

      <WhatsAppButton />
    </main>
  )
}
