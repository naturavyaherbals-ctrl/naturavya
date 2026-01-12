"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { createClient } from '@supabase/supabase-js'
import Link from "next/link"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { ArrowRight, Sparkles, Crown, Leaf } from "lucide-react"

// --- SUPABASE CONFIG ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* -------------------------------------------------------------------------- */
/* 1. 3D COMPONENTS                                                           */
/* -------------------------------------------------------------------------- */

function FloatingCrystal({ position, color = "#fbbf24", scale = 1 }: any) {
  const meshRef = useRef<any>()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  )
}

function CategoryBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 10] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <FloatingCrystal position={[-6, 3, -5]} scale={0.8} />
        <FloatingCrystal position={[6, -2, -5]} scale={0.6} />
        <FloatingCrystal position={[0, 5, -8]} scale={0.4} color="#10b981" />
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. LUXURY CARD COMPONENT (With 3D Tilt)                                    */
/* -------------------------------------------------------------------------- */

function LuxuryCategoryCard({ category, index }: { category: any, index: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 150, damping: 20 })

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

  // Handle Image Logic
  let displayImage = null
  if (category.image) displayImage = category.image
  else if (category.image_url) displayImage = category.image_url

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      className="perspective-1000"
    >
      <Link href={`/categories/${category.slug}`}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="group relative h-[500px] w-full bg-white rounded-[2rem] border border-amber-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          {/* Image Container */}
          <div className="absolute inset-0 bg-[#f8f8f8]">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={category.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50 opacity-50">
                <Leaf className="w-16 h-16 text-emerald-200 mb-4" />
                <span className="text-emerald-900/20 font-serif italic">Naturavya</span>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent opacity-80 transition-opacity duration-500" />
          </div>

          {/* Content Layer (Floating) */}
          <div 
            className="absolute inset-0 p-8 flex flex-col justify-end z-20"
            style={{ transform: "translateZ(30px)" }}
          >
            {/* Decorative Line */}
            <div className="w-12 h-1 bg-amber-400 mb-6 transform origin-left transition-all duration-500 group-hover:w-24" />
            
            <h3 className="text-3xl font-light text-white mb-2 font-serif tracking-wide">
              {category.title}
            </h3>
            
            {/* Description (Optional check) */}
            {category.description && (
              <p className="text-white/70 text-sm mb-6 line-clamp-2 font-light leading-relaxed transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                {category.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-amber-300 text-sm font-bold uppercase tracking-widest group-hover:text-amber-200 transition-colors">
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </div>
          </div>

          {/* Floating Badge */}
          <div 
            className="absolute top-6 right-6 z-30 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-[-10px] group-hover:translate-y-0"
            style={{ transform: "translateZ(50px)" }}
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>

        </motion.div>
      </Link>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. MAIN PAGE                                                               */
/* -------------------------------------------------------------------------- */

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { scrollY } = useScroll()
  const yText = useTransform(scrollY, [0, 300], [0, 100])

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("title")
      
      if (data) setCategories(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <main className="relative min-h-screen bg-[#fdfbf7] text-emerald-950 overflow-hidden selection:bg-amber-100 selection:text-emerald-900">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      {/* 3D Background */}
      <CategoryBackground3D />

      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24 relative">
          <motion.div style={{ y: yText }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-amber-200/50 shadow-sm mb-6">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-900 tracking-[0.2em] uppercase">The Apothecary</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-light mb-6 text-emerald-950">
              Curated <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-600">Wellness</span>
            </h1>
            
            <p className="text-lg text-emerald-800/60 max-w-2xl mx-auto font-light leading-relaxed">
              Explore our handcrafted collections, each designed to target specific aspects of your vitality and balance.
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-800/50 font-serif italic">Gathering Collections...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {categories?.map((category, index) => (
                <LuxuryCategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-emerald-900/10">
                <p className="text-xl font-serif text-emerald-900/40 italic">No collections currently available.</p>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  )
}