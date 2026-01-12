"use client"

import { useState, useEffect, useRef, use } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { ArrowLeft, ShoppingBag, Sparkles, Crown, ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react"
import WhatsAppButton from "@/components/whatsapp-button"

/* -------------------------------------------------------------------------- */
/* 1. STATIC DATA (Cleaned & Correct Images)                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES = {
  "mens-wellness": {
    title: "Men's Wellness",
    description: "Peak performance, vitality, and strength. Formulations designed for the modern alpha.",
    heroColor: "from-amber-100 to-orange-50"
  },
  "womens-wellness": {
    title: "Women's Wellness",
    description: "Grace, confidence, and inner balance. Holistic care for the feminine spirit.",
    heroColor: "from-rose-50 to-pink-50"
  },
  "general-health": {
    title: "General Health",
    description: "Daily essentials for immunity, digestion, and pain relief. The foundation of a healthy life.",
    heroColor: "from-emerald-50 to-green-50"
  },
  "essentials": { // Fallback category if needed
    title: " Essentials",
    description: "Daily care for specific needs.",
    heroColor: "from-blue-50 to-emerald-50"
  }
}

const staticProducts = [
  // --- MEN'S WELLNESS ---
  {
    id: 1,
    name: "Virya Plus",
    slug: "virya-plus",
    price: 1499,
    image_url: "/virya-plus.png", // ✅ Fixed Image
    short_description: "Premium vitality booster for sustained energy and stamina.",
    category_slug: "mens-wellness"
  },

  // --- WOMEN'S WELLNESS ---
  {
    id: 3,
    name: "Maxx Boom",
    slug: "maxx-boom",
    price: 1999,
    image_url: "/maxx-boom.png", // ✅ Fixed Image
    short_description: "Natural wellness formulation for restoring confidence and shape.",
    category_slug: "womens-wellness"
  },
  {
    id: 5,
    name: "V-Stiff Gel",
    slug: "v-stiff",
    price: 1199,
    image_url: "/v-stiff.png", // ✅ Fixed Image
    short_description: "Intimate wellness gel formulated with pure astringent extracts.",
    category_slug: "womens-wellness"
  },

  // --- GENERAL HEALTH ---
  {
    id: 2,
    name: "Zero Ache Oil",
    slug: "zero-ache",
    price: 899,
    image_url: "/zero-ache.png", // ✅ Fixed Image
    short_description: "Deep-penetrating herbal oil for instant joint pain relief.",
    category_slug: "general-health"
  },
  {
    id: 4,
    name: "Null Pile",
    slug: "null-pile",
    price: 1299,
    image_url: "/null-pile.png", // ✅ Fixed Image
    short_description: "Effective Ayurvedic relief from piles and fissures.",
    category_slug: "general-health"
  }
]

/* -------------------------------------------------------------------------- */
/* 2. 3D BACKGROUND ELEMENTS                                                  */
/* -------------------------------------------------------------------------- */

function LuxuryCrystal({ position, scale = 1, speed = 1, color = "#fbbf24" }: any) {
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
          color={color}
          metalness={0.9}
          roughness={0.05}
          emissive={color === "#fbbf24" ? "#d97706" : "#059669"}
          emissiveIntensity={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  )
}

function CategoryBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden fixed">
      <Canvas camera={{ position: [0, 0, 10] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <LuxuryCrystal position={[-7, 4, -5]} scale={0.9} speed={0.8} />
        <LuxuryCrystal position={[7, -2, -6]} scale={0.7} speed={1.1} color="#10b981" />
        <LuxuryCrystal position={[0, 6, -9]} scale={0.5} speed={0.9} />
        <LuxuryCrystal position={[-5, -5, -4]} scale={0.4} speed={1.3} color="#10b981" />
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. LUXURY PRODUCT CARD                                                     */
/* -------------------------------------------------------------------------- */

function ProductCard({ product, index }: { product: any, index: number }) {
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

  function handleMouseLeave() { x.set(0); y.set(0) }

  // Fallback Image Logic (Double check)
  const displayImage = product.image_url || "/hero-product.png"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="perspective-1000"
    >
      <Link href={`/products/${product.slug}`}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="group relative h-full bg-white rounded-[2rem] p-5 border border-amber-100/50 shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          {/* Image Area */}
          <div className="relative aspect-[4/5] bg-[#fbfbfb] rounded-[1.5rem] overflow-hidden mb-5 flex items-center justify-center">
            <motion.div style={{ transform: "translateZ(20px)" }} className="w-full h-full relative">
               <img 
                 src={displayImage} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 onError={(e) => { e.currentTarget.src = "/hero-product.png" }}
               />
            </motion.div>
            
            {/* Quick Add Overlay */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px] z-10">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-900 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                 <ShoppingBag size={20} />
               </div>
            </div>
          </div>

          {/* Info */}
          <div className="px-1" style={{ transform: "translateZ(10px)" }}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-emerald-950 font-serif leading-tight group-hover:text-amber-700 transition-colors">
                {product.name}
                </h3>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded text-xs">
                    ₹{product.price}
                </span>
            </div>
            
            <p className="text-emerald-800/60 text-xs mb-4 line-clamp-2 leading-relaxed h-8">
              {product.short_description}
            </p>
            
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider border-t border-amber-50 pt-3">
               <Sparkles size={12} /> Premium
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. MAIN PAGE COMPONENT                                                     */
/* -------------------------------------------------------------------------- */

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const categoryConfig = CATEGORIES[slug as keyof typeof CATEGORIES]

  const { scrollY } = useScroll()
  const yHero = useTransform(scrollY, [0, 300], [0, 100])
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0])

  // Filter products based on the slug
  const filteredProducts = staticProducts.filter(
    (product) => product.category_slug === slug
  )

  // 404 State (Visually handled)
  if (!categoryConfig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7] text-center p-6">
        <h1 className="text-4xl font-serif text-emerald-950 mb-4">Collection Not Found</h1>
        <Link href="/categories" className="text-amber-600 font-bold hover:underline">Return to Collections</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-emerald-950 relative selection:bg-amber-100 selection:text-amber-900">
      
      {/* 3D Background */}
      <CategoryBackground3D />
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-12 px-6 text-center z-10">
        <motion.div style={{ y: yHero, opacity: opacityHero }}>
          
          <Link href="/categories">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-emerald-100/50 shadow-sm mb-8 hover:bg-white transition-all text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <ArrowLeft size={14} /> All Collections
            </button>
          </Link>

          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-white flex items-center justify-center shadow-lg border border-amber-50">
                <Crown className="w-8 h-8 text-amber-600" />
             </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light mb-6 text-emerald-950 capitalize">
            {categoryConfig.title}
          </h1>
          
          <p className="text-lg text-emerald-800/60 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            {categoryConfig.description}
          </p>

          <div className="flex justify-center gap-4 text-xs font-bold text-emerald-900/40 uppercase tracking-widest">
             <span className="flex items-center gap-1"><Leaf size={12} /> 100% Herbal</span>
             <span className="flex items-center gap-1"><ShieldCheck size={12} /> Lab Tested</span>
             <span className="flex items-center gap-1"><Truck size={12} /> Fast Shipping</span>
          </div>
        </motion.div>
      </section>

      {/* --- PRODUCTS GRID --- */}
      <section className="px-6 pb-32 max-w-7xl mx-auto relative z-10 min-h-[50vh]">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-emerald-900/10">
            <p className="text-emerald-900/40 text-xl font-serif italic">This collection is currently being curated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <WhatsAppButton />
    </main>
  )
}
