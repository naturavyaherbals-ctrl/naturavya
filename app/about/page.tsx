"use client"

import { useRef } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import {
  Leaf,
  Heart,
  Target,
  Eye,
  Microscope,
  Globe,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"

/* ------------------------------------------------------------------ */
/* DATA */
/* ------------------------------------------------------------------ */

const teamMembers = [
  {
    name: "Dr. Aditya Sharma",
    role: "Founder & Chief Ayurvedic Officer",
    image: "/team-founder-ayurvedic-doctor-portrait.jpg",
    bio: "20+ years in Ayurvedic medicine, PhD from BHU",
  },
  {
    name: "Priya Venkatesh",
    role: "Co-Founder & CEO",
    image: "/team-cofounder-business-woman-portrait.jpg",
    bio: "Former McKinsey, passionate about wellness",
  },
  {
    name: "Dr. Meenakshi Iyer",
    role: "Head of Research",
    image: "/team-research-scientist-woman-portrait.jpg",
    bio: "PhD in Pharmacology, 15+ published papers",
  },
  {
    name: "Rahul Mehta",
    role: "Chief Technology Officer",
    image: "/team-cto-tech-man-portrait.jpg",
    bio: "Ex-Amazon, building tech for wellness",
  },
]

const timeline = [
  { year: "2018", title: "The Vision", description: "Founded with a mission to bring authentic Ayurveda to modern India" },
  { year: "2019", title: "First Products", description: "Launched flagship Ashwagandha and Shilajit formulations" },
  { year: "2020", title: "Research Lab", description: "Established in-house R&D facility" },
  { year: "2022", title: "National Reach", description: "Serving customers across India" },
  { year: "2024", title: "10K+ Customers", description: "Crossed 10,000 satisfied customers" },
  { year: "2025", title: "Global Expansion", description: "Launching in UAE and USA" },
]

const values = [
  { icon: Leaf, title: "Purity", description: "100% natural ingredients from trusted farms" },
  { icon: Microscope, title: "Science", description: "Backed by modern research and ancient wisdom" },
  { icon: Heart, title: "Care", description: "Customer wellness comes first" },
  { icon: Globe, title: "Sustainability", description: "Eco-friendly practices end to end" },
]

/* ------------------------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------------------------ */

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl">
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover scale-110"
        style={{ y }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <main className="overflow-hidden">
      <Navbar />

      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Our Story</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-light mb-6"
          >
            Reviving Ancient
            <span className="block text-primary font-medium mt-2">Ayurvedic Wisdom</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Bridging 5,000 years of Ayurveda with modern science for holistic wellness.
          </motion.p>
        </div>
      </motion.section>

      {/* VALUES */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <AnimatedSection key={value.title}>
              <motion.div whileHover={{ y: -8 }} className="p-6 bg-card rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
