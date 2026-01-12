"use client"

import { useState, useEffect, use } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { createClient } from '@supabase/supabase-js'
import Link from "next/link"
import { Canvas } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { 
  Star, ShoppingBag, ShieldCheck, Leaf, Truck, ChevronDown, 
  Minus, Plus, ArrowLeft, Crown, Sparkles 
} from "lucide-react"
import WhatsAppButton from "@/components/whatsapp-button" // <--- FIXED: Re-added this import

// --- SUPABASE CONFIG ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* -------------------------------------------------------------------------- */
/* 1. STATIC DATA LOOKUP (Fixes "Wrong Image/Product" Issue)                  */
/* -------------------------------------------------------------------------- */
const staticProducts = [
  {
    id: 1,
    name: "Virya Plus",
    slug: "virya-plus",
    price: 1499,
    original_price: 1999,
    rating: 4.9,
    reviews: 245,
    image_url: "/virya-plus.png", 
    description: "A premium Ayurvedic vitality booster designed for the modern man. Virya Plus combines Ashwagandha, Shilajit, and Safed Musli to restore stamina, improve energy levels, and reduce daily fatigue without side effects.",
    benefits: ["Boosts sustained energy", "Enhances physical stamina", "Reduces mental stress", "100% Non-hormonal formula"],
    ingredients: ["Ashwagandha Root", "Shilajit Resin", "Safed Musli", "Kaunch Beej"]
  },
  {
    id: 2,
    name: "Zero Ache Oil",
    slug: "zero-ache",
    price: 899,
    original_price: 1199,
    rating: 5.0,
    reviews: 189,
    image_url: "/zero-ache.png",
    description: "Deep-penetrating herbal relief for chronic joint pain and muscle stiffness. Infused with Mahanarayan Oil and Wintergreen, it provides instant warmth and long-lasting mobility support.",
    benefits: ["Instant pain relief", "Reduces joint stiffness", "Improves mobility", "Deep tissue penetration"],
    ingredients: ["Mahanarayan Oil", "Wintergreen", "Camphor", "Eucalyptus"]
  },
  {
    id: 3,
    name: "Null Pile",
    slug: "null-pile", 
    price: 1299,
    original_price: 1949,
    rating: 4.8,
    reviews: 128,
    image_url: "/null-pile.png",
    description: "A masterfully crafted Ayurvedic remedy for piles and fissures. This potent formulation combines rare Himalayan herbs to stop bleeding, reduce inflammation, and provide rapid relief within 7-8 days.",
    benefits: ["Stops bleeding instantly", "Shrinks pile mass", "Relieves constipation", "Surgical-free solution"],
    ingredients: ["Neem", "Haritaki", "Nagkesar", "Triphala Extract"]
  },
  {
    id: 4,
    name: "Maxx Boom",
    slug: "maxx-boom",
    price: 1999,
    original_price: 2499,
    rating: 4.9,
    reviews: 312,
    image_url: "/maxx-boom.png",
    description: "Natural wellness formulation for restoring confidence and physical vitality. Crafted to support holistic body toning and firmness safely over time.",
    benefits: ["Natural toning", "Restores confidence", "Hormone-free", "Skin-friendly formula"],
    ingredients: ["Shatavari", "Gambhari", "Olive Oil Base", "Almond Oil"]
  },
  {
    id: 5,
    name: "V-Stiff Gel",
    slug: "v-stiff",
    price: 1199,
    original_price: 1599,
    rating: 4.9,
    reviews: 156,
    image_url: "/v-stiff.png",
    description: "Intimate wellness gel formulated with pure astringent extracts for rejuvenation and tightness. Safe, hygienic, and easy to use.",
    benefits: ["Restores elasticity", "Natural astringent properties", "pH Balanced", "Non-sticky formula"],
    ingredients: ["Majhuphal", "Aloe Vera", "Rose Water", "Fitkari"]
  }
]

const DEFAULT_PRODUCT = staticProducts[0]

/* -------------------------------------------------------------------------- */
/* 2. 3D ELEMENTS                                                             */
/* -------------------------------------------------------------------------- */
function ProductBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#fbbf24" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
           <mesh position={[2, 2, -2]} scale={0.5}>
             <octahedronGeometry />
             <meshStandardMaterial color="#fbbf24" wireframe transparent opacity={0.2} />
           </mesh>
        </Float>
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. MAIN PRODUCT PAGE COMPONENT                                             */
/* -------------------------------------------------------------------------- */

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [product, setProduct] = useState<any>(null) 
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("benefits")

  // Fetch Product Logic
  useEffect(() => {
    async function fetchProduct() {
      // 1. Try finding in STATIC list first
      const foundStatic = staticProducts.find(p => p.slug === slug)
      
      if (foundStatic) {
        setProduct(foundStatic)
      } else {
        // 2. If not in static, try DB
        const { data } = await supabase.from('products').select('*').eq('slug', slug).single()
        if (data) {
          setProduct(data)
        } else {
          // 3. Fallback
          setProduct(DEFAULT_PRODUCT)
        }
      }
    }
    
    if (slug) fetchProduct()
  }, [slug])

  const { scrollY } = useScroll()
  const yImage = useTransform(scrollY, [0, 500], [0, 100])

  if (!product) return <div className="min-h-screen bg-[#fdfbf7]" /> 

  // Image Selection Logic
  let displayImage = "/hero-product.png"
  if (product.image_url) displayImage = product.image_url
  else if (product.image) displayImage = product.image
  else if (product.images && product.images.length > 0) {
      if (typeof product.images === 'string' && product.images.startsWith('[')) {
        try { displayImage = JSON.parse(product.images)[0] } catch(e) {}
      } else if (Array.isArray(product.images)) {
        displayImage = product.images[0]
      } else {
        displayImage = product.images 
      }
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-emerald-950 selection:bg-amber-100 selection:text-amber-900 overflow-hidden">
      <ProductBackdrop />
      
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] -z-10" />

      {/* --- NAVIGATION --- */}
      <div className="fixed top-24 left-6 z-50">
        <Link href="/products">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-amber-100 shadow-sm hover:shadow-md transition-all text-sm font-medium text-emerald-900">
            <ArrowLeft size={16} /> Back to Apothecary
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-start relative">
          
          {/* --- LEFT: PRODUCT IMAGE --- */}
          <motion.div 
            style={{ y: yImage }}
            className="lg:sticky lg:top-32 z-10"
          >
            <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-white to-[#f4f1ea] border border-white shadow-2xl overflow-hidden flex items-center justify-center group perspective-1000">
              
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/20 to-transparent opacity-50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-300/20 blur-[80px] rounded-full" />

              <motion.img 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                src={displayImage} 
                alt={product.name} 
                className="w-[80%] h-[80%] object-contain drop-shadow-2xl relative z-10"
              />

              <div className="absolute top-8 right-8 flex flex-col items-end">
                 <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-amber-100 flex items-center gap-2 mb-2">
                    <Crown size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Ayush Certified</span>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT: PRODUCT DETAILS --- */}
          <div className="space-y-10 relative z-20">
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Best Seller</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-medium text-emerald-900 ml-1">{product.rating} ({product.reviews} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-light text-emerald-950 mb-4 font-serif">{product.name}</h1>
              <p className="text-emerald-800/70 text-lg leading-relaxed font-light">{product.description}</p>
            </div>

            <div className="p-8 bg-white/60 backdrop-blur-xl border border-amber-100 rounded-[2rem] shadow-lg">
              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-bold text-emerald-900">₹{product.price}</span>
                {product.original_price && (
                  <span className="text-xl text-emerald-900/40 line-through decoration-amber-400/50 decoration-2 mb-1">₹{product.original_price}</span>
                )}
                <span className="text-sm font-bold text-amber-600 mb-2 bg-amber-50 px-2 py-1 rounded">30% OFF</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-white border border-emerald-100 rounded-full px-2 h-14 w-fit shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-800 transition-colors"><Minus size={16} /></button>
                  <span className="w-8 text-center font-bold text-emerald-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-800 transition-colors"><Plus size={16} /></button>
                </div>

                <button className="flex-1 h-14 bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-full font-bold text-lg shadow-xl shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2">
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-6 text-xs font-bold text-emerald-800/60 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Truck size={14} /> Free Shipping</span>
                <span className="flex items-center gap-2"><ShieldCheck size={14} /> Secure Checkout</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/40 border border-amber-100/50 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveTab(activeTab === 'benefits' ? '' : 'benefits')}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Sparkles size={18} /></div>
                    <span className="font-serif text-xl text-emerald-900">Ayurvedic Benefits</span>
                  </div>
                  <ChevronDown size={20} className={`text-emerald-400 transition-transform ${activeTab === 'benefits' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeTab === 'benefits' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-0"
                    >
                      <ul className="grid gap-3 pl-4">
                        {product.benefits?.map((benefit: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-emerald-800/80 font-light">
                            <Leaf size={16} className="text-emerald-500 mt-1 shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-white/40 border border-amber-100/50 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveTab(activeTab === 'ingredients' ? '' : 'ingredients')}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Leaf size={18} /></div>
                    <span className="font-serif text-xl text-emerald-900">Pure Ingredients</span>
                  </div>
                  <ChevronDown size={20} className={`text-emerald-400 transition-transform ${activeTab === 'ingredients' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeTab === 'ingredients' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-0"
                    >
                      <div className="flex flex-wrap gap-2">
                        {product.ingredients?.map((ing: string, i: number) => (
                          <span key={i} className="px-4 py-2 rounded-full bg-white border border-emerald-100 text-emerald-900 text-sm font-medium shadow-sm">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      <WhatsAppButton />
    </main>
  )
}