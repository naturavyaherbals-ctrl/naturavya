"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import { Sparkles, ShieldCheck, ArrowRight, Crown, Gem, Droplets, Sun, Microscope, UserCheck, Quote, Star, CheckCircle2, Leaf, Flame } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import Link from "next/link"
import { Canvas } from '@react-three/fiber'
import { Stars, Sparkles as ThreeSparkles } from '@react-three/drei'

// --- EXISTING IMPORTS ---
import SeoSchema from "@/components/seo-schema"
import FAQSchema from "@/components/faq-schema"
import WhatsAppButton from "@/components/whatsapp-button"

// --- SUPABASE CONFIG ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* -------------------------------------------------------------------------- */
/* 1. 3D ATMOSPHERE (Global)                                                  */
/* -------------------------------------------------------------------------- */

function LuxuryGoldDust() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 h-screen w-full">
      <Canvas camera={{ position: [0, 0, 5] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.4} />
        <ThreeSparkles count={40} scale={3} size={2} speed={0.2} opacity={0.4} color="#fbbf24" />
        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={0.5} />
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. PARALLAX WRAPPER (MOBILE SMOOTHNESS FIX)                                */
/* -------------------------------------------------------------------------- */

// FIX: Added stronger shadow and border-t to make the "stacking" obvious on phone.
// sticky top-0 ensures it waits until it hits the top before the next one covers it.
function ParallaxSection({ children, className = "", zIndex = 0 }: { children: React.ReactNode, className?: string, zIndex?: number }) {
  return (
    <div 
      className={`sticky top-0 min-h-[100dvh] flex flex-col justify-center overflow-hidden shadow-[0_-5px_40px_-10px_rgba(0,0,0,0.1)] border-t border-black/5 ${className}`} 
      style={{ zIndex }}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. HERO COMPONENT (Fixed Badges & Mobile Size)                             */
/* -------------------------------------------------------------------------- */

function LuxuryHeroProduct() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 100, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 100, damping: 25 })

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = (event.clientX - rect.left) / width - 0.5
    const mouseY = (event.clientY - rect.top) / height - 0.5
    x.set(mouseX)
    y.set(mouseY)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className="relative w-[280px] sm:w-[350px] md:w-[450px] aspect-square cursor-pointer group z-20 mx-auto"
      style={{ perspective: 1000 }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-full h-full">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-amber-400/20 rounded-full blur-[60px] md:blur-[80px]" />
        
        {/* MAIN PRODUCT IMAGE (Z-Index 10) */}
        <motion.div 
          style={{ transform: "translateZ(20px)", zIndex: 10 }} 
          className="relative w-full h-full flex items-center justify-center"
        >
          <img src="/hero-product.png" alt="Naturavya Luxury Collection" className="w-auto h-full object-contain drop-shadow-2xl" />
        </motion.div>

        {/* FLOATING BADGE 1 (Z-Index 100 - Forces it in front) */}
        <motion.div 
          animate={{ y: [0, -15, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-white/90 backdrop-blur-xl px-4 py-2 md:px-5 md:py-3 rounded-2xl shadow-xl border border-amber-100"
          style={{ transform: "translateZ(150px)", zIndex: 100 }}
        >
           <div className="flex items-center gap-2 md:gap-3">
             <div className="bg-amber-50 p-1.5 md:p-2 rounded-full"><Crown size={14} className="text-amber-700 md:w-4 md:h-4"/></div>
             <div>
               <p className="text-[8px] md:text-[10px] uppercase font-bold text-amber-900 tracking-widest">Royal Grade</p>
               <p className="text-[10px] md:text-xs font-serif text-emerald-950">Certified Potency</p>
             </div>
           </div>
        </motion.div>

        {/* FLOATING BADGE 2 (Z-Index 100 - Forces it in front) */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white/90 backdrop-blur-xl px-4 py-2 md:px-5 md:py-3 rounded-2xl shadow-xl border border-emerald-50"
          style={{ transform: "translateZ(120px)", zIndex: 100 }}
        >
           <div className="flex items-center gap-2 md:gap-3">
             <div className="bg-emerald-50 p-1.5 md:p-2 rounded-full"><Gem size={14} className="text-emerald-700 md:w-4 md:h-4"/></div>
             <div>
               <p className="text-[8px] md:text-[10px] uppercase font-bold text-emerald-900 tracking-widest">Pure</p>
               <p className="text-[10px] md:text-xs font-serif text-emerald-950">Himalayan Sourced</p>
             </div>
           </div>
        </motion.div>

      </motion.div>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* MARQUEE 1: TOP (HERO)                                                      */
/* -------------------------------------------------------------------------- */
function TopMarquee() {
  return (
    <div className="w-full bg-[#0c1a16] border-y border-amber-900/30 py-4 overflow-hidden relative z-10">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="whitespace-nowrap flex gap-20"
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-20">
             <span className="text-amber-100/60 text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-4">
               <Sparkles size={14} className="text-amber-600" /> Naturavya • The Essence of Life
             </span>
             <span className="text-amber-100/60 text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-4">
               <Crown size={14} className="text-amber-600" /> Pure Himalayan Sourcing
             </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MARQUEE 2: BOTTOM (CTA)                                                    */
/* -------------------------------------------------------------------------- */
function BottomMarquee() {
  return (
    <div className="w-full overflow-hidden mb-12 opacity-40 absolute top-20 pointer-events-none">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="whitespace-nowrap flex gap-12"
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-12 text-amber-200 text-xs font-bold tracking-[0.3em] uppercase">
             <span>Exclusive Access</span><span>•</span>
             <span>Lifetime Guarantee</span><span>•</span>
             <span>Ayurvedic Mastery</span><span>•</span>
             <span>Pure Luxury</span><span>•</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION 1: HERO (Sticky, Z-10)                                             */
/* -------------------------------------------------------------------------- */

function LuxuryHeroSection() {
  return (
    <ParallaxSection className="bg-[#fdfbf7]" zIndex={10}>
      
      {/* TOP MARQUEE */}
      <div className="mt-28 mb-8">
        <TopMarquee />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative w-full flex-grow pb-12">
        <div className="text-center lg:text-left pl-2">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="inline-flex items-center gap-3 mb-8 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-amber-100"
           >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-900/80 tracking-[0.3em] uppercase">Est. 2025 • India</span>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.1 }}
             className="text-5xl lg:text-7xl font-light leading-[1.1] text-emerald-950 mb-8 font-serif"
           >
             Reclaim Your <br />
             <span className="italic text-amber-600 relative">
               Vitality.
             </span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-lg text-emerald-900/70 font-light leading-loose max-w-lg mx-auto lg:mx-0 mb-12"
           >
             Naturavya combines ancient Vedic wisdom with modern purity. Handcrafted <strong>Sex & Power Enhancement</strong> solutions for men’s vigor, and holistic relief for total balance.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start"
           >
              <Link href="/products/virya-plus">
                <button className="h-14 px-10 rounded-full bg-emerald-950 text-white text-sm font-bold tracking-wider shadow-2xl hover:bg-emerald-900 hover:shadow-emerald-900/30 hover:-translate-y-1 transition-all flex items-center gap-3 group">
                   Explore Virya+ <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/categories">
                <button className="h-14 px-10 rounded-full bg-white border border-emerald-900/10 text-emerald-950 text-sm font-bold tracking-wider hover:bg-emerald-50 transition-all shadow-sm">
                   View All Elixirs
                </button>
              </Link>
           </motion.div>
        </div>

        <div className="relative flex justify-center">
           <LuxuryHeroProduct />
        </div>
      </div>
    </ParallaxSection>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION 2: THE MANIFESTO (Sticky, Z-20)                                    */
/* -------------------------------------------------------------------------- */

function LuxuryManifesto() {
  return (
    <ParallaxSection className="bg-[#fffefc]" zIndex={20}>
      <div className="max-w-4xl mx-auto px-6 text-center py-32">
        <Crown size={32} className="text-amber-400 mx-auto mb-8" strokeWidth={1} />
        
        <h2 className="text-3xl md:text-5xl font-serif text-emerald-950 leading-tight mb-12">
          "We don't just treat symptoms. <br/>
          <span className="italic text-amber-600">We unleash potential.</span>"
        </h2>

        <div className="space-y-8 text-lg md:text-xl font-light text-emerald-800/60 leading-relaxed">
          <p>
            At <strong>Naturavya</strong>, we believe that true power comes from within. Whether it is restoring masculine vigor with our flagship <strong>Virya Plus Capsules</strong> or finding relief from chronic pain, our mission is holistic restoration.
          </p>
          <p>
            Our formulations are not born in factories; they are birthed from the earth, refined by fire, and perfected by science. This is the <strong>Gold Standard</strong> of Ayurvedic care.
          </p>
        </div>

        <div className="mt-12 w-24 h-1 bg-amber-200/50 mx-auto rounded-full" />
      </div>
    </ParallaxSection>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION 3: RARE INGREDIENTS (Sticky, Z-30)                                 */
/* -------------------------------------------------------------------------- */

function IngredientCard({ title, desc, icon: Icon }: any) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-[2.5rem] border border-amber-100 shadow-xl min-h-[300px] flex flex-col items-center text-center justify-center group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-white rounded-full flex items-center justify-center text-amber-600 mb-6 mx-auto shadow-sm">
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-serif text-emerald-950 mb-3">{title}</h3>
        <p className="text-emerald-900/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function RareIngredients() {
  return (
    <ParallaxSection className="bg-[#fdfbf7]" zIndex={30}>
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
           <span className="text-amber-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-3 block">The Source</span>
           <h2 className="text-4xl lg:text-5xl font-light text-emerald-950 font-serif">Rare & <span className="italic text-amber-600">Potent</span></h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <IngredientCard 
            title="Himalayan Shilajit" 
            desc="A powerhouse ingredient infused in our capsules. Sourced from 16,000ft, it amplifies stamina and core strength." 
            icon={Gem} 
          />
          <IngredientCard 
            title="Kaunch Beej" 
            desc="Nature's testosterone booster. A critical component in Virya Plus for enhanced drive and performance." 
            icon={Sun} 
          />
          <IngredientCard 
            title="Safed Musli" 
            desc="The 'Divya Aushad' of Ayurveda. Known for improving vitality and reducing physical fatigue." 
            icon={Leaf} 
          />
        </div>
      </div>
    </ParallaxSection>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION 4: LUXURY COLLECTION (Sticky, Z-40)                                */
/* -------------------------------------------------------------------------- */

function LuxuryCollection() {
  const featuredProducts = [
    { name: "Virya Plus", price: 1499, desc: "Premium Sex & Power Enhancement Capsules", slug: "virya-plus", image: "/virya-plus.png" },
    { name: "Zero Ache", price: 899, desc: "Instant Pain Relief Oil", slug: "zero-ache", image: "/zero-ache.png" },
    { name: "Maxx Boom", price: 1999, desc: "Natural Body Toning & Wellness", slug: "maxx-boom", image: "/maxx-boom.png" }
  ]

  return (
    <ParallaxSection className="bg-[#fdfbf7]" zIndex={40}>
      <div className="max-w-[80rem] mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-emerald-900/5 pb-8">
           <div>
             <span className="text-amber-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-3 block">The Apothecary</span>
             <h2 className="text-4xl lg:text-5xl font-light text-emerald-950 font-serif">Curated <span className="italic text-amber-600">Elixirs</span></h2>
           </div>
           <Link href="/categories">
             <button className="mt-6 md:mt-0 text-xs font-bold uppercase tracking-widest text-emerald-900 border-b border-emerald-900/30 hover:border-emerald-900 pb-1 transition-all">
               View All Formulations
             </button>
           </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {featuredProducts.map((product, i) => (
              <Link href={`/products/${product.slug}`} key={i} className="group">
                <div className="h-full flex flex-col bg-white rounded-[2rem] overflow-hidden border border-emerald-50 hover:border-amber-100 shadow-sm hover:shadow-2xl transition-all duration-700">
                  <div className="relative aspect-[4/5] bg-[#fcfcfc] flex items-center justify-center p-10 overflow-hidden">
                     <motion.img 
                       whileHover={{ scale: 1.05 }}
                       transition={{ duration: 0.5 }}
                       src={product.image} 
                       onError={(e) => e.currentTarget.src='/hero-product.png'}
                       alt={product.name} 
                       className="w-full h-full object-contain drop-shadow-lg" 
                     />
                  </div>
                  
                  <div className="p-8 bg-white border-t border-gray-50 flex-grow flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <h3 className="text-lg md:text-2xl font-serif text-emerald-950">{product.name}</h3>
                            <span className="text-xs md:text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">₹{product.price}</span>
                        </div>
                        <p className="text-emerald-900/50 text-xs line-clamp-2 mb-4">{product.desc}</p>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest group-hover:text-amber-600 transition-colors flex items-center gap-2">
                        View Details <ArrowRight size={14} />
                     </span>
                  </div>
                </div>
              </Link>
           ))}
        </div>
      </div>
    </ParallaxSection>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION 5: TRUST & AUTHORITY (Sticky, Z-50)                                */
/* -------------------------------------------------------------------------- */

function TrustAuthority() {
  return (
    <ParallaxSection className="bg-[#0c1a16] text-amber-50" zIndex={50}>
       <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

       <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 grid lg:grid-cols-2 gap-12 md:gap-20 items-center py-20 md:py-32">
          <div className="text-center lg:text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 mb-6">
                <UserCheck size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100">Vaidya Approved</span>
             </div>
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-tight mb-6 md:mb-8">
               Science Meets <span className="italic text-white/50">Tradition.</span>
             </h2>
             <div className="space-y-6 text-base md:text-lg text-white/60 font-light leading-loose">
               <p>
                 Naturavya is a collective of Ayurvedic practitioners and modern scientists. We don't just guess; we verify.
               </p>
               <p>
                 Every bottle of <strong>Null Pile</strong> or <strong>Virya Plus</strong> passes through rigorous checkpoints. From soil testing to the final GMP-certified bottling, purity is our obsession.
               </p>
             </div>
             <div className="mt-8 md:mt-12 flex justify-center lg:justify-start gap-8 md:gap-12 border-t border-white/10 pt-8">
               <div>
                  <div className="text-3xl md:text-4xl font-serif text-amber-400 mb-1">100%</div>
                  <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Herbal Actives</div>
               </div>
               <div>
                  <div className="text-3xl md:text-4xl font-serif text-amber-400 mb-1">0%</div>
                  <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Steroids / Toxins</div>
               </div>
             </div>
          </div>
          
          <div className="relative px-4 md:px-0">
             <div className="aspect-[3/4] rounded-[2rem] md:rounded-[3rem] bg-[#12241f] border border-white/5 overflow-hidden relative shadow-2xl flex items-center justify-center">
                <Microscope size={100} className="text-white/10 md:w-[120px] md:h-[120px]" strokeWidth={0.5} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a16] via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-10 z-20">
                   <p className="text-xl md:text-2xl font-serif text-white mb-2">Clinical Precision</p>
                   <p className="text-[10px] md:text-xs text-amber-400 uppercase tracking-widest">Lab Tested for Safety</p>
                </div>
             </div>
          </div>
       </div>
    </ParallaxSection>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION 6: TESTIMONIALS (Sticky, Z-60)                                     */
/* -------------------------------------------------------------------------- */

function TestimonialsSection() {
  const reviews = [
    { name: "Rajesh K.", role: "Virya+ User", text: "I have tried many supplements for stamina, but Naturavya operates on a different level. The purity is palpable." },
    { name: "Sneha P.", role: "V-Stiff User", text: "Elegant packaging, but more importantly, results that speak for themselves. Truly the gold standard." },
    { name: "Amit K.", role: "Zero Ache User", text: "The oil penetrates deep. My joint pain has significantly reduced. I feel a renewed sense of mobility." },
  ]

  return (
    <ParallaxSection className="bg-[#fdfbf7]" zIndex={60}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="text-center mb-12 md:mb-16">
          <Quote className="w-6 h-6 md:w-8 md:h-8 text-amber-200 mx-auto mb-4 md:mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif text-emerald-950">Voices of <span className="italic text-amber-600">Trust</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-emerald-50 hover:border-amber-100 hover:shadow-xl transition-all duration-300 flex flex-col">
               <div className="flex gap-1 mb-4 md:mb-6">
                 {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
               </div>
               <p className="text-emerald-900/70 italic text-sm md:text-base mb-6 md:mb-8 leading-relaxed flex-grow">"{review.text}"</p>
               <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-white flex items-center justify-center text-amber-800 font-serif font-bold shadow-sm">
                   {review.name[0]}
                 </div>
                 <div>
                   <p className="text-sm font-bold text-emerald-950">{review.name}</p>
                   <div className="flex items-center gap-1">
                     <CheckCircle2 size={10} className="text-emerald-600" />
                     <p className="text-[9px] md:text-[10px] text-emerald-900/40 uppercase tracking-widest">{review.role}</p>
                   </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </ParallaxSection>
  )
}

/* -------------------------------------------------------------------------- */
/* SECTION 7: CTA SECTION (Sticky, Z-70)                                      */
/* -------------------------------------------------------------------------- */

function LuxuryCTA() {
  return (
    <ParallaxSection className="bg-[#052e25]" zIndex={70}>
      <div className="relative h-[60vh] md:h-[80vh] flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />

        {/* BOTTOM MARQUEE */}
        <BottomMarquee />

        <div className="relative z-10 text-center max-w-3xl mx-auto mt-10">
          <Crown size={32} strokeWidth={0.5} className="text-amber-400 mx-auto mb-6 md:mb-8 md:w-12 md:h-12" />
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-light text-amber-50 mb-6 md:mb-8">
            Elevate Your <span className="italic text-amber-500">Life.</span>
          </h2>
          <p className="text-lg md:text-xl text-emerald-100/60 max-w-xl mx-auto mb-10 md:mb-12 font-light leading-relaxed">
             Join the elite circle of Naturavya patrons. Experience the transformation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <Link href="/categories">
              <button className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs md:text-sm font-bold uppercase tracking-widest shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all">
                 Enter The Sanctuary
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-transparent border border-white/20 text-white rounded-full text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                 Contact Concierge
              </button>
            </Link>
          </div>
        </div>
      </div>
    </ParallaxSection>
  )
}

/* -------------------------------------------------------------------------- */
/* MAIN PAGE EXPORT                                                           */
/* -------------------------------------------------------------------------- */

export default function LuxuryHomePage() {
  return (
    <main className="relative bg-[#fdfbf7] text-emerald-950 selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@200;300;400;500;600&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <SeoSchema />
      <FAQSchema />
      <LuxuryGoldDust />

      <LuxuryHeroSection />
      <LuxuryManifesto />
      <RareIngredients />
      <LuxuryCollection />
      <TrustAuthority />
      <TestimonialsSection />
      <LuxuryCTA />
      
      <WhatsAppButton />
    </main>
  )
}