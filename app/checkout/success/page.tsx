"use client"

import Link from "next/link"
import { Check, ArrowRight, Home, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { useRef } from "react"

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

function SuccessBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden fixed">
      <Canvas camera={{ position: [0, 0, 8] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <LuxuryCrystal position={[-4, 3, -5]} scale={0.7} speed={0.8} />
        <LuxuryCrystal position={[4, -2, -6]} scale={0.5} speed={1.1} />
        <LuxuryCrystal position={[0, 5, -8]} scale={0.4} speed={0.9} />
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. MAIN SUCCESS PAGE                                                       */
/* -------------------------------------------------------------------------- */

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 relative overflow-hidden text-emerald-950 selection:bg-amber-100 selection:text-amber-900">
      
      <SuccessBackground3D />
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 max-w-md w-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-10 text-center"
      >
        {/* Success Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </motion.div>
          {/* Pulsing Rings */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-emerald-500/30"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="absolute inset-0 rounded-full border border-emerald-500/20"
          />
        </div>
        
        <h1 className="text-4xl font-serif font-medium mb-3 text-emerald-950">
          Order Confirmed
        </h1>
        
        <p className="text-emerald-900/60 mb-8 leading-relaxed">
          Thank you for choosing Naturavya. Your journey to wellness has begun. We have sent a confirmation email to you.
        </p>

        <div className="space-y-4">
          <Link href="/categories" className="block">
            <button className="w-full h-14 bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-xl font-bold shadow-xl shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group">
              Continue Shopping 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <Link href="/" className="block">
            <button className="w-full h-14 bg-white border border-emerald-100 text-emerald-800 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-900/10 flex items-center justify-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest">
           <Sparkles size={12} /> Pure Ayurveda
        </div>

      </motion.div>
    </div>
  )
}

