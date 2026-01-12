"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Loader2, ArrowRight, ShoppingBag, Sparkles } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

// --- SUPABASE CLIENT ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* -------------------------------------------------------------------------- */
/* 1. 3D BACKGROUND ELEMENTS                                                  */
/* -------------------------------------------------------------------------- */

function LuxuryCrystal({ position, scale = 1, speed = 1 }: any) {
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

function SearchBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden fixed">
      <Canvas camera={{ position: [0, 0, 10] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <LuxuryCrystal position={[-7, 4, -5]} scale={0.9} speed={0.8} />
        <LuxuryCrystal position={[7, -2, -6]} scale={0.7} speed={1.1} />
        <LuxuryCrystal position={[0, 6, -9]} scale={0.5} speed={0.9} />
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. MAIN SEARCH PAGE                                                        */
/* -------------------------------------------------------------------------- */

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Search Logic
  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      // Note: Searching 'name' instead of 'title' to match standard schema. 
      // If your DB uses 'title', change .ilike("name", ...) to .ilike("title", ...)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${query}%`) 
        .limit(10)

      if (!error && data) {
        setResults(data)
      }
      setLoading(false)
    }

    const timer = setTimeout(searchProducts, 500)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-emerald-950 relative selection:bg-amber-100 selection:text-amber-900 pt-32 pb-20">
      
      {/* 3D Background */}
      <SearchBackground3D />
      
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200/50 shadow-sm mb-6">
            <Search className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-bold text-emerald-900 tracking-[0.2em] uppercase">Discovery</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-4">
            Find Your <span className="italic text-amber-600">Elixir</span>
          </h1>
        </div>

        {/* --- SEARCH INPUT --- */}
        <div className="relative max-w-2xl mx-auto mb-16 group">
          <div className="absolute inset-0 bg-amber-200/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white/80 backdrop-blur-xl border border-amber-100 rounded-full shadow-lg flex items-center p-2 focus-within:ring-2 focus-within:ring-amber-200/50 transition-all">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </div>
            <input
              type="text"
              placeholder="Search for wellness, vitality, relief..."
              className="flex-1 bg-transparent border-none outline-none text-lg px-4 text-emerald-900 placeholder:text-emerald-900/30 h-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* --- RESULTS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {results.map((product, index) => {
              // Image Fallback Logic
              const img = product.image_url || product.image || "/hero-product.png"
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="group flex items-center gap-5 p-5 bg-white/60 backdrop-blur-md border border-white/50 hover:border-amber-200 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50/0 via-amber-50/50 to-amber-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                    <div className="w-20 h-20 bg-[#fbfbfb] rounded-2xl overflow-hidden shrink-0 border border-emerald-50 relative shadow-inner">
                      <img src={img} alt={product.name || product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-serif font-bold text-lg text-emerald-950 truncate group-hover:text-amber-700 transition-colors">
                          {product.name || product.title}
                        </h3>
                      </div>
                      <p className="text-emerald-800/50 text-sm line-clamp-1 mb-3">
                        {product.short_description || "Premium Ayurvedic Formulation"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-900 font-bold bg-white/50 px-3 py-1 rounded-full text-xs border border-emerald-100">
                          ₹{product.price}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <ShoppingBag size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* --- EMPTY STATES --- */}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-900/20">
              <Search size={32} />
            </div>
            <p className="text-emerald-900/40 text-xl font-serif italic">
              We could not find "{query}" in our apothecary.
            </p>
            <Link href="/categories" className="inline-flex items-center gap-2 mt-4 text-amber-600 font-bold hover:underline">
              Browse Collections <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* --- INITIAL STATE --- */}
        {!loading && query.length < 2 && (
          <div className="text-center py-12">
            <p className="text-xs font-bold text-emerald-900/30 uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles size={12} /> Popular Searches
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {["Vitality", "Pain Relief", "Immunity", "Detox"].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-6 py-2 rounded-full bg-white border border-emerald-100 text-emerald-800 text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}