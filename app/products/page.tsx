"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { createClient } from '@supabase/supabase-js'
import Link from "next/link"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { Search, ShoppingBag, Filter, ArrowRight, Sparkles, Crown } from "lucide-react"
import WhatsAppButton from "@/components/whatsapp-button"

// --- SUPABASE CONFIG ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* -------------------------------------------------------------------------- */
/* 1. STATIC DATA (Fixed Images & Categories)                                 */
/* -------------------------------------------------------------------------- */
const staticProducts = [
  {
    id: 1,
    name: "Virya Plus",
    price: 1499,
    slug: "virya-plus",
    short_description: "Premium vitality booster for sustained energy, stamina, and mental focus. 100% Ayurvedic.",
    // ✅ CHANGED: Specific image path
    image_url: "/virya-plus.png", 
    // ✅ CONFIRMED: Category is Vitality
    category: "Vitality"
  },
  {
    id: 2,
    name: "Zero Ache Oil",
    price: 899,
    slug: "zero-ache",
    short_description: "Deep-penetrating herbal oil for instant relief from joint pain, stiffness, and muscle soreness.",
    // ✅ CHANGED: Specific image path
    image_url: "/zero-ache.png",
    category: "Pain Relief"
  },
  {
    id: 3,
    name: "Maxx Boom",
    price: 1999,
    slug: "maxx-boom",
    short_description: "Natural wellness formulation for restoring confidence and physical vitality safely.",
    // ✅ CHANGED: Specific image path
    image_url: "/maxx-boom.png",
    category: "Wellness"
  },
  {
    id: 4,
    name: "Null Pile",
    price: 1299,
    slug: "null-pile",
    short_description: "Effective relief from piles, fissures, and discomfort. Fast-acting herbal remedy.",
    // ✅ CHANGED: Specific image path
    image_url: "/null-pile.png",
    category: "Essentials"
  },
  {
    id: 5,
    name: "V-Stiff Gel",
    price: 1199,
    slug: "v-stiff",
    short_description: "Intimate wellness gel formulated with pure extracts for rejuvenation and tightness.",
    // ✅ CHANGED: Specific image path
    image_url: "/v-stiff.png",
    category: "Wellness"
  },
  {
    id: 6,
    name: "Ashwagandha Gold",
    price: 799,
    slug: "ashwagandha-gold",
    short_description: "Pure Himalayan Ashwagandha root extract for stress relief and superior immunity.",
    image_url: "/ashwagandha.png", // Ensure this exists or fallback will occur
    category: "Vitality"
  },
  {
    id: 7,
    name: "Shilajit Resin",
    price: 2499,
    slug: "shilajit-resin",
    short_description: "Authentic Himalayan Shilajit in its purest resin form. The ultimate source of power.",
    image_url: "/shilajit.png", // Ensure this exists or fallback will occur
    category: "Vitality"
  },
  {
    id: 8,
    name: "Triphala Detox",
    price: 599,
    slug: "triphala-detox",
    short_description: "Gentle daily detox for digestive health and overall lightness. Ancient recipe.",
    image_url: "/triphala.png", // Ensure this exists or fallback will occur
    category: "Essentials"
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

function ProductsBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden fixed">
      <Canvas camera={{ position: [0, 0, 10] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <LuxuryCrystal position={[-7, 4, -5]} scale={0.9} speed={0.8} />
        <LuxuryCrystal position={[7, -2, -6]} scale={0.7} speed={1.1} />
        <LuxuryCrystal position={[0, 6, -9]} scale={0.5} speed={0.9} />
        <LuxuryCrystal position={[-5, -5, -4]} scale={0.4} speed={1.3} />
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

  function handleMouseLeave() { x.set(0); y.set(0) }

  // --- ROBUST IMAGE LOGIC ---
  let displayImage = "/hero-product.png" // Ultimate Fallback
  
  if (product.image_url && product.image_url !== "") {
      displayImage = product.image_url
  } 
  else if (product.image && product.image !== "") {
      displayImage = product.image
  }
  else if (product.images && product.images.length > 0) {
      if (typeof product.images === 'string' && product.images.startsWith('[')) {
        try { displayImage = JSON.parse(product.images)[0] } catch(e) {}
      } else if (Array.isArray(product.images)) {
        displayImage = product.images[0]
      } else {
        displayImage = product.images 
      }
  }

  const linkHref = product.slug ? `/products/${product.slug}` : `/products/${product.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="perspective-1000"
    >
      <Link href={linkHref}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="group relative h-full bg-white rounded-[2.5rem] p-6 border border-amber-100/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-100/50 rounded-full blur-3xl -z-10 transition-opacity opacity-0 group-hover:opacity-100" />

          {/* Image Area */}
          <div className="relative aspect-[4/5] bg-[#fbfbfb] rounded-[2rem] overflow-hidden mb-6 flex items-center justify-center">
            <motion.div style={{ transform: "translateZ(30px)" }} className="w-full h-full relative">
               <img 
                 src={displayImage} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 onError={(e) => {
                    // Fallback if the specific image file doesn't exist yet
                    e.currentTarget.src = "/hero-product.png"
                 }}
               />
            </motion.div>
            
            {/* Price Tag */}
            <div 
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-amber-100 flex items-center gap-1 z-20"
              style={{ transform: "translateZ(50px)" }}
            >
              <span className="text-amber-600 font-bold font-serif italic">₹</span>
              <span className="text-emerald-950 font-bold">{product.price}</span>
            </div>

            {/* Quick Action */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-10">
               <button className="bg-white text-emerald-900 px-6 py-3 rounded-full font-bold shadow-xl transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                 <ShoppingBag size={18} /> View Details
               </button>
            </div>
          </div>

          {/* Info Area */}
          <div className="px-2" style={{ transform: "translateZ(20px)" }}>
            <h3 className="text-xl font-bold text-emerald-950 mb-2 font-serif tracking-wide group-hover:text-amber-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-emerald-800/60 text-sm mb-4 line-clamp-2 leading-relaxed">
              {product.short_description || "Premium Ayurvedic formulation for holistic wellness."}
            </p>
            
            <div className="flex items-center justify-between border-t border-amber-50 pt-4">
               <div className="flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{product.category || "Premium"}</span>
               </div>
               <ArrowRight size={18} className="text-emerald-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. MAIN PAGE                                                               */
/* -------------------------------------------------------------------------- */

const FILTERS = ["All", "Vitality", "Pain Relief", "Wellness", "Essentials"]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>(staticProducts)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const { scrollY } = useScroll()
  const yHero = useTransform(scrollY, [0, 300], [0, 100])
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0])

  // --- FETCH PRODUCTS (Merge Strategy) ---
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*')
      if (data && data.length > 0) {
        // If DB has products, use them. 
        // NOTE: Ensure your DB 'products' table has correct image_url values.
        setProducts(data)
      } else {
        // Fallback to static if DB is empty
        setProducts(staticProducts)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // --- FILTERING LOGIC ---
  const filteredProducts = products.filter(product => {
    // Search Check
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Category Check (Robust)
    let matchesFilter = true
    if (activeFilter !== "All") {
       const cat = product.category || ""
       const desc = product.short_description || ""
       const name = product.name || ""
       // Check if category matches, or if description contains keywords
       matchesFilter = 
         cat.includes(activeFilter) || 
         desc.toLowerCase().includes(activeFilter.toLowerCase()) ||
         name.toLowerCase().includes(activeFilter.toLowerCase())
    }
    
    return matchesSearch && matchesFilter
  })

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-emerald-950 relative selection:bg-amber-100 selection:text-amber-900">
      
      {/* 3D Background */}
      <ProductsBackground3D />
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-12 px-6 text-center z-10">
        <motion.div style={{ y: yHero, opacity: opacityHero }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200/50 shadow-sm mb-8">
            <Crown className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-900 tracking-[0.2em] uppercase">The Apothecary</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light mb-6 text-emerald-950">
            Curated <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-600">Excellence</span>
          </h1>
          
          <p className="text-lg text-emerald-800/60 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Explore our collection of handcrafted Ayurvedic formulations, designed to elevate your vitality and balance.
          </p>
        </motion.div>

        {/* --- CONTROLS BAR (Sticky) --- */}
        <div className="max-w-7xl mx-auto sticky top-24 z-30">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-xl border border-amber-100 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4 justify-between"
          >
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search elixir..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-emerald-50/50 border border-transparent focus:border-amber-200 rounded-xl py-3 pl-12 pr-4 outline-none text-emerald-900 placeholder:text-emerald-900/30 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all whitespace-nowrap
                    ${activeFilter === filter 
                      ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' 
                      : 'bg-white text-emerald-800/60 hover:bg-amber-50 hover:text-amber-800 border border-transparent hover:border-amber-100'}
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PRODUCTS GRID --- */}
      <section className="px-6 pb-32 max-w-7xl mx-auto relative z-10 min-h-[60vh]">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-800/50 font-serif italic">Unlocking the vault...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-emerald-900/40 text-xl font-serif italic">No elixirs found matching your search.</p>
            <button 
              onClick={() => {setSearchTerm(""); setActiveFilter("All")}}
              className="mt-4 text-amber-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <WhatsAppButton />
    </main>
  )
}
