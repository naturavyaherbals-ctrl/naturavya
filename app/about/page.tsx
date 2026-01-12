"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import Image from "next/image"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, Environment } from '@react-three/drei'
import WhatsAppButton from "@/components/whatsapp-button"
import {
  Leaf,
  Heart,
  Microscope,
  Globe,
  Sparkles,
  CheckCircle2,
  Crown,
  ScrollText
} from "lucide-react"

/* ------------------------------------------------------------------ */
/* 1. ENHANCED 3D BACKGROUND COMPONENTS                               */
/* ------------------------------------------------------------------ */

// Small floating crystals
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
          opacity={0.7}
        />
      </mesh>
    </Float>
  )
}

// Large central abstract object for Hero
function CentralHeroObject() {
    const meshRef = useRef<any>()
    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.002
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
      }
    })
    return (
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh ref={meshRef} scale={[3.5, 3.5, 3.5]} position={[0, 0, -2]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            wireframe={true} 
            metalness={1} 
            roughness={0}
            emissive="#fbbf24"
            emissiveIntensity={0.1}
          />
        </mesh>
      </Float>
    )
}

function AboutBackground3D({ hero = false }) {
  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${hero ? 'h-[120%]' : ''}`}>
      <Canvas camera={{ position: [0, 0, 6] }} gl={{ alpha: true }} className="pointer-events-none">
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fcd34d" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#10b981" />
        <Environment preset="city" />
        
        {hero && <CentralHeroObject />}

        <LuxuryCrystal position={[-4, 3, -3]} scale={0.6} speed={0.8} />
        <LuxuryCrystal position={[5, -2, -4]} scale={0.4} speed={1.2} />
        <LuxuryCrystal position={[-2, -4, -2]} scale={0.3} speed={1} />
        <LuxuryCrystal position={[3, 4, -5]} scale={0.5} speed={0.9} />
      </Canvas>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2. HERO SECTION (With Central 3D Object)                           */
/* ------------------------------------------------------------------ */

function AboutHero() {
  const { scrollY } = useScroll()
  const yText = useTransform(scrollY, [0, 500], [0, 250])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-[#fdfbf7] perspective-1000">
      <AboutBackground3D hero={true} />
      
      {/* Deeper Gradients */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-emerald-200/20 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3" />

      <motion.div 
        style={{ y: yText, opacity }}
        className="max-w-5xl mx-auto px-6 text-center relative z-20"
      >
        <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
           className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/80 backdrop-blur-md border border-amber-200/50 shadow-sm mb-8"
        >
          <ScrollText className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-900 tracking-[0.2em] uppercase">Our Heritage</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl md:text-8xl font-light text-emerald-950 mb-8 leading-none drop-shadow-sm"
        >
          Guardians of <br/>
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-600">
            Ancient Wisdom
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl text-emerald-900/80 max-w-2xl mx-auto leading-relaxed font-light"
        >
          At Naturavya, we bridge 5,000 years of Vedic tradition with modern science to craft pure, unadulterated wellness solutions for the modern soul.
        </motion.p>
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 3. THE STORY (Interactive 3D Tilt Image)                           */
/* ------------------------------------------------------------------ */

function AboutStory() {
    // 3D Tilt Logic
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 })
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 })
  
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

  return (
    <section className="py-32 px-6 relative overflow-hidden">
       <AboutBackground3D />
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Interactive 3D Image Container */}
        <div className="perspective-1000">
            <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative aspect-[4/5] rounded-[3rem] shadow-2xl border border-white/50 cursor-pointer group"
            >
            {/* Image Layer */}
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden" style={{ transform: "translateZ(20px)" }}>
                <img 
                src="https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?auto=format&fit=crop&w=800&q=80" 
                alt="Ayurvedic Preparation" 
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 to-transparent" />
            </div>
            
            {/* Floating Badge Layer (Pops out more) */}
            <motion.div 
                className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-amber-100 z-20"
                style={{ transform: "translateZ(60px)" }}
            >
                <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-500" />
                <div>
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider leading-none mb-1">Established</p>
                    <p className="text-xl font-serif text-emerald-950 leading-none">2018</p>
                </div>
                </div>
            </motion.div>
            
            {/* Decorative Pattern Layer (Behind) */}
            <div 
                className="absolute -top-8 -right-8 w-full h-full border-2 border-amber-200/30 rounded-[3rem] -z-10" 
                style={{ transform: "translateZ(-40px)" }}
            />
            </motion.div>
        </div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-8 pl-0 md:pl-10"
        >
          <h2 className="text-5xl md:text-6xl font-light text-emerald-950 leading-tight">
            From <span className="font-serif italic text-amber-700">Roots</span> to Remedies
          </h2>
          
          <div className="space-y-6 text-emerald-900/80 text-lg font-light leading-relaxed">
            <p className="text-xl text-emerald-950">
              It began with a singular question: <em>In a world of synthetics, where has the purity gone?</em>
            </p>
            <p>
              Naturavya was born from a desire to reclaim that purity. Starting as a passionate endeavor in the heart of India, we have grown into a sanctuary for those who seek authentic healing.
            </p>
            <p>
              Every formulation—from our potent <strong>V-Stiff</strong> to the revitalizing <strong>Maxx Boom</strong>—is a chapter in our story of patience and potency. We do not mass produce; we craft.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-8">
            {[
              "100% Herbal Actives",
              "Zero Side Effects",
              "Cruelty Free",
              "GMP Certified"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-emerald-100 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <span className="text-emerald-900 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 4. CORE VALUES (3D Rotating Cards)                                 */
/* ------------------------------------------------------------------ */

const values = [
  { icon: Leaf, title: "Purity First", description: "Sourced directly from organic farms. No fillers, only essence." },
  { icon: Microscope, title: "Science-Backed", description: "Ancient Vedic wisdom validated by modern clinical research." },
  { icon: Heart, title: "Customer Care", description: "We treat your wellness journey as if it were our own." },
  { icon: Globe, title: "Indian Heritage", description: "Proudly formulating in India to support local economies." },
]

function AboutValues() {
  return (
    <section className="py-32 px-6 bg-[#052e25] text-white relative overflow-hidden perspective-1000">
      {/* 3D Elements overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#fcd34d" />
             <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                <mesh position={[3,-2,-2]} scale={[2,2,2]} rotation={[0.5, 0.5, 0]}>
                    <torusKnotGeometry args={[1, 0.3, 100, 16]} />
                    <meshStandardMaterial color="#064e3b" wireframe transparent opacity={0.1} />
                </mesh>
            </Float>
        </Canvas>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-light mb-6 text-amber-50">Our Guiding <span className="font-serif italic text-amber-400">Principles</span></h2>
          <p className="text-emerald-200/70 max-w-2xl mx-auto text-xl font-light">The uncompromising standards that define every Naturavya creation.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {values.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, rotateX: 15, y: 50 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -15, rotateX: 5, scale: 1.02 }}
              style={{ transformStyle: "preserve-3d" }}
              className="p-10 bg-gradient-to-br from-white/10 to-white/5 border border-amber-100/10 rounded-[2.5rem] hover:bg-white/15 transition-all duration-500 backdrop-blur-md group shadow-2xl"
            >
              <div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/30"
                style={{ transform: "translateZ(20px)" }}
              >
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-amber-50" style={{ transform: "translateZ(10px)" }}>{value.title}</h3>
              <p className="text-white/70 leading-relaxed font-light text-sm">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 5. TIMELINE (3D Scroll Entrance)                                   */
/* ------------------------------------------------------------------ */

const timeline = [
  { year: "2018", title: "The Vision", description: "Founded with a mission to revive authentic Indian wellness." },
  { year: "2019", title: "Pure Formulations", description: "Launched flagship Ashwagandha with 100% purity guarantee." },
  { year: "2020", title: "Research Facility", description: "Established in-house R&D to ensure zero heavy metals." },
  { year: "2024", title: "Nationwide Trust", description: "Crossed 10,000+ satisfied families across India." },
]

function AboutTimeline() {
  return (
    <section className="py-40 px-6 bg-[#fdfbf7] relative overflow-hidden">
      {/* 3D Background elements */}
      <AboutBackground3D />
      
      {/* Central Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-amber-300/50 to-transparent -translate-x-1/2 hidden md:block" />

      <div className="max-w-4xl mx-auto relative z-10 perspective-1000">
        <div className="text-center mb-24">
           <span className="text-emerald-600 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Our Journey</span>
           <h2 className="text-5xl md:text-6xl font-light text-emerald-950">A Legacy in <span className="font-serif italic text-amber-600">Motion</span></h2>
        </div>

        <div className="space-y-20">
          {timeline.map((item, i) => (
            <motion.div 
              key={i}
              // 3D Entrance Animation
              initial={{ opacity: 0, y: 100, rotateX: -20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 0.8, delay: i * 0.1, type: "spring", bounce: 0.4 }}
              className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Content Card */}
              <div className="flex-1 text-center md:text-left w-full group perspective-1000">
                <motion.div 
                    whileHover={{ rotateX: i % 2 === 0 ? 5 : -5, rotateY: i % 2 === 0 ? -5 : 5, scale: 1.02 }}
                    style={{ transformStyle: "preserve-3d" }}
                    className={`bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-amber-100 shadow-xl transition-all duration-500 ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
                >
                  <span className="text-5xl font-serif text-amber-300/80 block mb-4" style={{ transform: "translateZ(10px)" }}>{item.year}</span>
                  <h3 className="text-2xl font-bold text-emerald-950 mb-3" style={{ transform: "translateZ(5px)" }}>{item.title}</h3>
                  <p className="text-emerald-800/70 text-base leading-relaxed">{item.description}</p>
                </motion.div>
              </div>

              {/* Center 3D Marker */}
              <div className="relative shrink-0 z-10">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-lg shadow-amber-500/30">
                     <div className="w-full h-full rounded-full bg-[#fdfbf7] flex items-center justify-center border-4 border-white">
                        <div className="w-4 h-4 rounded-full bg-emerald-600" />
                     </div>
                 </div>
                 {/* Glow behind marker */}
                 <div className="absolute inset-0 bg-amber-400/40 blur-xl -z-10 rounded-full" />
              </div>

              {/* Empty Side for Spacing */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 6. LUXURY FOOTER CTA                                               */
/* ------------------------------------------------------------------ */

function AboutCTA() {
  return (
    <section className="py-40 px-6 bg-[#022c22] text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      {/* Deep Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Crown className="w-16 h-16 text-amber-400 mx-auto mb-8 opacity-80" />
        <h2 className="text-5xl md:text-7xl font-light text-white mb-8 leading-tight">Join the Circle of <span className="font-serif italic text-amber-400">Wellness</span></h2>
        <p className="text-xl text-white/70 mb-16 font-light max-w-2xl mx-auto leading-relaxed">Experience the difference of true, lab-certified Ayurveda crafted for the modern era.</p>
        
        <button className="group relative px-16 py-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-white font-bold text-xl shadow-2xl hover:shadow-amber-500/30 transition-all overflow-hidden">
          <span className="relative z-10">Explore Our Collection</span>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* MAIN PAGE EXPORT                                                   */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <main className="bg-[#fdfbf7] text-emerald-950 selection:bg-amber-100 selection:text-amber-900">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutTimeline />
      <AboutCTA />
      
      <WhatsAppButton />
    </main>
  )
}