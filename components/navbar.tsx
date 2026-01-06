"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image" // 👈 1. Import Image component
import { Menu, X, ShoppingBag, Search, User } from "lucide-react"
import { useCart } from "@/app/context/cart-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/testimonials", label: "Stories" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const { cartCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3"> {/* Increased gap for better spacing */}
            
            {/* 👇 2. YOUR LOGO HERE */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm">
               <Image 
                 src="/logo.png"        // Ensure 'logo.png' is in your public folder
                 alt="Naturavya Logo"
                 fill                   // This makes it fill the container
                 className="object-cover"
               />
            </div>

            <span className="text-2xl font-semibold tracking-wide text-foreground">
              Naturavya
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart Button */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-20 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-border transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-foreground/80 hover:text-primary transition-colors py-2 text-lg"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="flex-1" asChild>
               <Link href="/search" onClick={() => setIsOpen(false)}>
                 <Search className="h-4 w-4 mr-2" />
                 Search
               </Link>
            </Button>

            {/* Mobile Cart Link */}
            <Button variant="outline" size="sm" className="flex-1" asChild>
               <Link href="/cart" onClick={() => setIsOpen(false)}>
                 <ShoppingBag className="h-4 w-4 mr-2" />
                 Cart ({cartCount})
               </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar