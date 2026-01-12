"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingBag, Search, User, Sparkles } from "lucide-react"
import { useCart } from "@/app/context/cart-context"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"

/* --- CONFIGURATION --- */
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Elixirs" },
  { href: "/about", label: "Our Story" },
  { href: "/reviews", label: "Journal" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false) // Fix for Hydration Error
  
  const { scrollY } = useScroll()
  const pathname = usePathname()
  const { cartCount } = useCart()

  // Prevent Hydration Mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle Scroll Behavior
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) setHidden(true)
    else setHidden(false)
    setScrolled(latest > 50)
  })

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
  }, [isOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* 1. Announcement Bar */}
      <motion.div 
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="absolute top-0 left-0 right-0 h-9 z-[60] bg-[#052e25] text-[#e8d5b5] flex items-center justify-center text-xs tracking-[0.2em] font-medium uppercase pointer-events-auto"
      >
        <Sparkles className="w-3 h-3 mr-2" />
        Free Shipping on Orders Over ₹999
      </motion.div>

      {/* 2. Main Navbar */}
      <motion.nav
        variants={{ visible: { y: 36 }, hidden: { y: -100 } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={cn(
          "absolute top-0 left-0 right-0 transition-all duration-500 pointer-events-auto",
          scrolled ? "py-2" : "py-6"
        )}
      >
        <div 
          className={cn(
            "max-w-7xl mx-auto px-6 transition-all duration-500",
            scrolled 
              ? "bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full mx-4 sm:mx-8 pr-6 pl-4"
              : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between h-14">
            
            {/* --- LOGO --- */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-amber-100/50 shadow-sm group-hover:shadow-md transition-all duration-500">
                <Image 
                  src="/logo.png" 
                  alt="Naturavya"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <span className="font-serif text-2xl tracking-wide text-emerald-950">
                Naturavya
              </span>
            </Link>

            {/* --- DESKTOP LINKS --- */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="relative px-4 py-2 group"
                  >
                    <span className={cn(
                      "relative z-10 text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                      isActive ? "text-amber-600" : "text-emerald-900/70 group-hover:text-emerald-950"
                    )}>
                      {link.label}
                    </span>
                    <span className="absolute inset-0 bg-amber-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 -z-0" />
                  </Link>
                )
              })}
            </div>

            {/* --- ICONS --- */}
            <div className="flex items-center gap-2">
              <Link href="/search" className="hidden md:flex p-2 text-emerald-900/60 hover:text-amber-600 transition-colors">
                <Search className="w-5 h-5" />
              </Link>
              
              <Link href="/cart" className="relative p-2 text-emerald-900/60 hover:text-amber-600 transition-colors group">
                <ShoppingBag className="w-5 h-5" />
                {/* Mounted check fixes Hydration Error on Cart Count */}
                <AnimatePresence>
                  {mounted && cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute top-0 right-0 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-emerald-950"
              >
                <div className="w-6 flex flex-col items-end gap-[5px]">
                  <span className={cn("h-[2px] bg-current transition-all duration-300", isOpen ? "w-6 rotate-45 translate-y-[7px]" : "w-6")} />
                  <span className={cn("h-[2px] bg-current transition-all duration-300", isOpen ? "opacity-0" : "w-4")} />
                  <span className={cn("h-[2px] bg-current transition-all duration-300", isOpen ? "w-6 -rotate-45 -translate-y-[7px]" : "w-6")} />
                </div>
              </button>
            </div>

          </div>
        </div>
      </motion.nav>

      {/* 3. Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-md md:hidden pointer-events-auto"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#fdfbf7] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-serif text-2xl text-emerald-950">Menu</span>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-emerald-50 rounded-full text-emerald-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-3xl font-light text-emerald-950 hover:text-amber-600 hover:pl-4 transition-all duration-300 block"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-emerald-900/10">
                 <Link href="/account" className="flex items-center gap-4 text-emerald-900 mb-4">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">My Account</span>
                 </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}