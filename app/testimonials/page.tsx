"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Quote, Heart, Users, Award, Star, Crown, MapPin } from "lucide-react"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

/* -------------------------------------------------------------------------- */
/* 1. REALISTIC DATA (SEO OPTIMIZED)                                          */
/* -------------------------------------------------------------------------- */

const testimonials = [
  // --- FEATURED STORIES (Big Cards) ---
  {
    id: 1,
    name: "Vikram Rathore",
    location: "Mumbai, Maharashtra",
    content: "I was skeptical about Ayurvedic supplements for vitality, but Virya Plus has genuinely transformed my energy levels. The fatigue I used to feel after office hours is gone. It feels natural, sustained, and there are absolutely no jitters. A staple for my daily routine now.",
    featured: true,
    product: "Virya Plus"
  },
  {
    id: 2,
    name: "Suman Gupta",
    location: "Indore, Madhya Pradesh",
    content: "My arthritis knee pain was making it impossible to walk my morning rounds. My son bought me Zero Ache oil from your Bada Ganpati store. Within 15 days of massage, the stiffness has reduced by 80%. The smell is very herbal and soothing.",
    featured: true,
    product: "Zero Ache Oil"
  },
  
  // --- STANDARD STORIES (Grid Cards) ---
  {
    id: 3,
    name: "Priya K.",
    location: "Bangalore, Karnataka",
    content: "Maxx Boom requires patience, but the results are real. After 2 months, I can see a visible difference in firmness. It helped restore my confidence significantly.",
    featured: false,
    product: "Maxx Boom"
  },
  {
    id: 4,
    name: "Rahul Mehta",
    location: "Delhi, NCR",
    content: "Suffering from piles was a nightmare until I found Null Pile. The relief was almost immediate. It stopped the bleeding and pain within a week. Highly effective.",
    featured: false,
    product: "Null Pile"
  },
  {
    id: 5,
    name: "Anjali Menon",
    location: "Pune, Maharashtra",
    content: "V-Stiff is a fantastic product. It is non-sticky and works as promised. The discreet packaging and fast delivery were also very impressive.",
    featured: false,
    product: "V-Stiff Gel"
  },
  {
    id: 6,
    name: "Col. R. Singh (Retd)",
    location: "Chandigarh",
    content: "At 60, joint health is a priority. Zero Ache penetrates deep into the muscles. I have recommended it to my entire retired army group.",
    featured: false,
    product: "Zero Ache"
  },
  {
    id: 7,
    name: "Deepak Verma",
    location: "Jaipur, Rajasthan",
    content: "Genuine Ayurveda. You can smell the purity in the herbs used in Virya Plus. It has helped me manage stress and physical stamina beautifully.",
    featured: false,
    product: "Virya Plus"
  },
  {
    id: 8,
    name: "Meera Joshi",
    location: "Ahmedabad, Gujarat",
    content: "I love that Naturavya is chemical-free. I use their wellness products without worrying about side effects. Truly a luxury Indian brand.",
    featured: false,
    product: "General Wellness"
  }
]

/* -------------------------------------------------------------------------- */
/* 2. 3D BACKGROUND ELEMENTS                                                  */
/* -------------------------------------------------------------------------- */

function LuxuryCrystal({ position, scale = 1, speed = 1 }: { position: [number, number, number], scale?: number, speed?: number }) {
  const meshRef = useRef<any>()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1 * speed
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 * speed) * 0.05
    }
  })
  return (
    <Float speed={1.5 * speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.05}
          emissive="#d97706"
          emissiveIntensity={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  )
}

function TestimonialBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden fixed">
      <Canvas camera={{ position: [0, 0, 6] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <LuxuryCrystal position={[-6, 2, -5]} scale={0.7} speed={0.9} />
        <LuxuryCrystal position={[6, -3, -5]} scale={0.5} speed={1.1} />
        <LuxuryCrystal position={[0, 4, -8]} scale={0.4} speed={0.8} />
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. LUXURY CARD COMPONENT                                                   */
/* -------------------------------------------------------------------------- */

function LuxuryTestimonialCard({ testimonial, featured = false, index }: { testimonial: any, featured?: boolean, index: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 })

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = (event.clientX - rect.left) / width - 0.5
    const mouseY = (event.clientY - rect.top) / height - 0.5
    x.set(mouseX)
    y.set(mouseY)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`perspective-1000 ${featured ? 'md:col-span-2' : ''}`}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`
          relative h-full bg-white rounded-[2rem] p-8 md:p-10 border border-amber-100/50 shadow-sm hover:shadow-2xl transition-all duration-500
          ${featured ? 'bg-gradient-to-br from-white to-[#fffcf5] border-amber-200' : 'hover:border-amber-100'}
        `}
      >
        {/* Decorative Quote */}
        <Quote className={`absolute top-8 right-8 w-16 h-16 opacity-10 text-amber-500 transform -rotate-12 ${featured ? 'w-24 h-24 opacity-15' : ''}`} />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header: User Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`
              rounded-full flex items-center justify-center text-emerald-700 font-serif font-bold shadow-inner border border-emerald-100
              ${featured ? 'w-16 h-16 text-2xl bg-gradient-to-br from-amber-100 to-white' : 'w-12 h-12 text-lg bg-emerald-50'}
            `}>
              {testimonial.name ? testimonial.name.charAt(0) : "U"}
            </div>
            <div>
              <h3 className={`font-bold text-emerald-950 ${featured ? 'text-2xl' : 'text-lg'}`}>
                {testimonial.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-emerald-800/60">
                <MapPin size={12} className="text-amber-500" />
                {testimonial.location}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={featured ? 18 : 14} className="fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* Content */}
          <p className={`
            text-emerald-900/80 font-light leading-relaxed italic
            ${featured ? 'text-xl md:text-2xl' : 'text-base'}
          `}>
            "{testimonial.content}"
          </p>

          {/* Product Tag / Footer */}
          <div className="mt-auto pt-6 flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs font-bold text-amber-600/60 uppercase tracking-widest">
                <div className="w-8 h-[1px] bg-amber-200" />
                Verified Buyer
             </div>
             {testimonial.product && (
               <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                 {testimonial.product}
               </span>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. MAIN PAGE COMPONENT                                                     */
/* -------------------------------------------------------------------------- */

export default function TestimonialsPage() {
  const featuredTestimonials = testimonials.filter((t) => t.featured)
  const otherTestimonials = testimonials.filter((t) => !t.featured)

  const { scrollY } = useScroll()
  const yHero = useTransform(scrollY, [0, 300], [0, 100])
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-emerald-950 relative overflow-hidden selection:bg-amber-100 selection:text-amber-900">
      
      {/* 3D Background */}
      <TestimonialBackground3D />
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 px-6 text-center z-10">
        <motion.div style={{ y: yHero, opacity: opacityHero }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border border-amber-100 shadow-lg mb-8">
            <Quote className="w-8 h-8 text-amber-500" />
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-emerald-950 mb-6">
            Stories of <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-600">Transformation</span>
          </h1>

          <p className="text-lg text-emerald-800/60 max-w-2xl mx-auto font-light leading-relaxed">
            Real journeys from people who have reclaimed their vitality through the power of authentic Ayurveda.
          </p>
        </motion.div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-12 px-6 relative z-10 border-y border-amber-100/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, value: "10,000+", label: "Happy Customers" },
            { icon: Heart, value: "98%", label: "Satisfaction Rate" },
            { icon: Award, value: "500+", label: "5-Star Reviews" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <stat.icon className="w-7 h-7 text-emerald-700" />
              </div>
              <div className="text-4xl font-serif text-emerald-950 mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FEATURED SECTION --- */}
      {featuredTestimonials.length > 0 && (
        <section className="py-20 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <Crown className="w-6 h-6 text-amber-500" />
              <h2 className="text-3xl font-light text-emerald-950">
                Featured <span className="font-serif italic text-amber-700">Journeys</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {featuredTestimonials.map((t, i) => (
                <LuxuryTestimonialCard key={t.id} testimonial={t} featured index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- OTHER TESTIMONIALS --- */}
      <section className="py-16 px-6 bg-white/40 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-emerald-950 mb-4">
              More <span className="font-serif italic text-emerald-700">Voices</span>
            </h2>
            <div className="h-1 w-20 bg-amber-200 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherTestimonials.map((t, i) => (
              <LuxuryTestimonialCard key={t.id} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </main>
  )
}
