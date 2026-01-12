"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag, ShieldCheck, Truck, Sparkles } from "lucide-react"
import { useCart } from "@/app/context/cart-context"
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

function CartBackground3D() {
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
/* 2. MAIN CART PAGE                                                          */
/* -------------------------------------------------------------------------- */

export default function CartPage() {
  const { items, addToCart, removeFromCart, deleteItem, cartCount } = useCart()
  const [mounted, setMounted] = useState(false)

  // Prevent Hydration Mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const freeShippingThreshold = 999
  const progress = Math.min((total / freeShippingThreshold) * 100, 100)

  if (!mounted) return null

  // --- EMPTY STATE ---
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <CartBackground3D />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/60 backdrop-blur-xl p-12 rounded-[3rem] border border-amber-100 shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-3xl font-serif text-emerald-950 mb-3">Your Sanctuary is Empty</h2>
          <p className="text-emerald-800/60 mb-8">
            The path to vitality awaits. Explore our apothecary for premium Ayurvedic solutions.
          </p>
          <Link href="/categories">
            <button className="bg-emerald-900 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-800 transition-all flex items-center gap-2 mx-auto shadow-lg hover:shadow-emerald-900/20">
              Explore The Apothecary <ArrowRight size={16} />
            </button>
          </Link>
        </motion.div>
      </main>
    )
  }

  // --- FILLED STATE ---
  return (
    <main className="min-h-screen bg-[#fdfbf7] text-emerald-950 relative selection:bg-amber-100 selection:text-amber-900 pt-32 pb-20">
      
      <CartBackground3D />
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl md:text-5xl font-light font-serif">
            Your <span className="italic text-amber-600">Selection</span>
          </h1>
          <span className="text-sm font-bold bg-white border border-amber-100 px-4 py-2 rounded-full text-emerald-800">
            {cartCount} Items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* --- LEFT: CART ITEMS --- */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group flex flex-col sm:flex-row gap-6 p-6 bg-white/80 backdrop-blur-md border border-amber-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-full sm:w-32 h-32 bg-[#fbfbfb] rounded-2xl overflow-hidden shrink-0 relative border border-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-900/20 text-xs">No Image</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-emerald-950 mb-1">{item.title}</h3>
                        <p className="text-sm text-emerald-800/50 font-medium">Unit Price: ₹{item.price}</p>
                      </div>
                      <p className="font-bold text-xl text-emerald-900">₹{item.price * item.quantity}</p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100/50 rounded-full px-4 py-2">
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-emerald-800 transition-all disabled:opacity-30"
                          onClick={() => removeFromCart(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        
                        <span className="w-4 text-center font-bold text-emerald-900">{item.quantity}</span>
                        
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-emerald-800 transition-all" 
                          onClick={() => addToCart(item)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      {/* Delete */}
                      <button 
                        className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider p-2"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* --- RIGHT: ORDER SUMMARY --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              
              {/* Summary Card */}
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-amber-100 shadow-2xl relative overflow-hidden">
                {/* Gold Gradient Top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300" />
                
                <h3 className="font-serif text-2xl text-emerald-950 mb-6">Order Summary</h3>
                
                {/* Free Shipping Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs font-bold text-emerald-800/60 mb-2 uppercase tracking-wide">
                    <span>{progress < 100 ? `Add ₹${freeShippingThreshold - total} for Free Shipping` : "Free Shipping Unlocked!"}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between text-emerald-900/70">
                    <span>Subtotal</span>
                    <span className="font-medium font-serif">₹{total}</span>
                  </div>
                  <div className="flex justify-between text-emerald-900/70">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold">{total >= freeShippingThreshold ? "Free" : "₹50"}</span>
                  </div>
                  <div className="pt-4 border-t border-dashed border-emerald-900/10 flex justify-between text-xl font-bold text-emerald-950">
                    <span>Total</span>
                    <span>₹{total >= freeShippingThreshold ? total : total + 50}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <button className="w-full h-14 bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    Checkout Securely <ShieldCheck size={18} />
                  </button>
                </Link>

                <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold text-emerald-800/40 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Truck size={12} /> Fast Delivery</span>
                  <span className="w-1 h-1 bg-emerald-800/20 rounded-full" />
                  <span className="flex items-center gap-1"><Sparkles size={12} /> Authentic</span>
                </div>
              </div>

              {/* Coupon Code (Optional Visual) */}
              <div className="p-6 rounded-3xl border border-dashed border-emerald-900/20 flex items-center justify-between text-emerald-900/60 bg-white/40">
                <span className="text-sm font-medium">Have a promo code?</span>
                <span className="text-xs font-bold text-amber-600 cursor-pointer hover:underline">Apply at Checkout</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}