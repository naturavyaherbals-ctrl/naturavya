"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Mail, Lock, User, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

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

function LoginBackground3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden fixed">
      <Canvas camera={{ position: [0, 0, 8] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <LuxuryCrystal position={[-4, 2, -5]} scale={0.8} speed={0.6} />
        <LuxuryCrystal position={[4, -3, -5]} scale={0.6} speed={0.9} />
      </Canvas>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. MAIN LOGIN PAGE                                                         */
/* -------------------------------------------------------------------------- */

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isLogin) {
      const res = await login(formData)
      if (res?.error) setError(res.error)
    } else {
      const res = await signup(formData)
      if (res?.error) setError(res.error)
      if (res?.success) setMessage(res.success)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 relative overflow-hidden text-emerald-950 selection:bg-amber-100 selection:text-amber-900">
      
      {/* 3D Background */}
      <LoginBackground3D />
      
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800/60 hover:text-emerald-900 hover:pl-2 transition-all mb-6 font-medium text-sm uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>

        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
          
          {/* Gold Top Border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-100">
               <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-3xl font-serif text-emerald-950 mb-2">
                  {isLogin ? "Welcome Back" : "Join the Legacy"}
                </h1>
                <p className="text-emerald-800/60 font-light text-sm">
                  {isLogin
                    ? "Enter your credentials to access your sanctuary."
                    : "Begin your journey to holistic wellness today."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-red-50/80 border border-red-100 text-red-700 p-3 rounded-xl text-sm mb-6 text-center">
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-emerald-50/80 border border-emerald-100 text-emerald-700 p-3 rounded-xl text-sm mb-6 text-center">
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-5">
            
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="name" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Full Name</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 group-focus-within:text-amber-600 transition-colors">
                        <User className="h-4 w-4" />
                    </div>
                    <Input id="name" name="name" placeholder="John Doe" required className="pl-12 h-12 bg-white/50 border-emerald-100/50 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all text-emerald-900" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Email</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 group-focus-within:text-amber-600 transition-colors">
                    <Mail className="h-4 w-4" />
                </div>
                <Input id="email" name="email" type="email" placeholder="hello@example.com" required className="pl-12 h-12 bg-white/50 border-emerald-100/50 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all text-emerald-900" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Password</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 group-focus-within:text-amber-600 transition-colors">
                    <Lock className="h-4 w-4" />
                </div>
                <Input id="password" name="password" type="password" placeholder="••••••••" required className="pl-12 h-12 bg-white/50 border-emerald-100/50 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all text-emerald-900" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-900/20 transition-all mt-4" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-emerald-900/10 text-center">
            <p className="text-sm text-emerald-800/60 mb-2">
              {isLogin ? "New to Naturavya?" : "Already a member?"}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setMessage(null)
              }}
              className="text-amber-700 font-bold hover:text-amber-800 text-sm uppercase tracking-widest border-b-2 border-amber-200 hover:border-amber-600 transition-all pb-1"
            >
              {isLogin ? "Create an Account" : "Sign In Here"}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
