import Link from "next/link"
import {
  Leaf,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Crown,
  ArrowRight
} from "lucide-react"
import { createClient } from "@/app/lib/supabase/server"

const footerLinks = {
  shop: [
    { label: "Men's Vitality", href: "/categories/mens-wellness" },
    { label: "Women's Wellness", href: "/categories/womens-wellness" },
    { label: "General Health", href: "/categories/general-health" },
    { label: "All Elixirs", href: "/products" },
  ],
  company: [
    { label: "Our Heritage", href: "/about" },
    { label: "Journal", href: "/stories" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Reviews", href: "/reviews" },
  ],
  support: [
    { label: "Contact Concierge", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ]
}

export default async function Footer() {
  const supabase = await createClient()

  // 1. Fetch settings (Optional: Wrap in try/catch if table doesn't exist yet)
  let settings: any[] = []
  try {
    const { data } = await supabase.from("settings").select("*")
    if (data) settings = data
  } catch (e) {
    // Silent fail for static build
  }

  // 2. Helper to get value safely
  const getVal = (key: string, fallback: string) => 
    settings?.find((s: any) => s.key === key)?.value || fallback

  // 3. Get dynamic values
  const phone = getVal("phone", "+91 7222959340")
  const email = getVal("support_email", "contact@naturavya.com")
  const address = getVal("address", "India")
  const cleanPhone = phone.replace(/[^0-9]/g, '')

  const socialLinks = [
    { icon: Phone, url: `tel:${phone}` },
    { icon: MessageCircle, url: `https://wa.me/${cleanPhone}` },
    { icon: Instagram, url: getVal("instagram", "#") },
    { icon: Facebook, url: getVal("facebook", "#") },
  ]

  return (
    <footer className="bg-[#052e25] text-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      {/* Golden Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 via-amber-400 to-emerald-900"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- TOP SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-emerald-900" />
              </div>
              <span className="text-3xl font-serif text-amber-50">Naturavya</span>
            </Link>

            <p className="text-emerald-100/70 leading-relaxed mb-8 font-light">
              Reviving the royal tradition of Ayurveda. Pure, potent, and proven formulations for the modern connoisseur.
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all duration-300"
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* Shop */}
            <div>
              <h4 className="font-serif text-xl text-amber-100 mb-6">Collections</h4>
              <ul className="space-y-4">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-serif text-xl text-amber-100 mb-6">Heritage</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif text-xl text-amber-100 mb-6">Concierge</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-amber-500 mt-1" />
                  <div>
                    <span className="block text-xs text-emerald-100/40 uppercase tracking-wider mb-1">Call Us</span>
                    <a href={`tel:${phone}`} className="text-emerald-100 hover:text-white transition">{phone}</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-amber-500 mt-1" />
                  <div>
                    <span className="block text-xs text-emerald-100/40 uppercase tracking-wider mb-1">Email Us</span>
                    <a href={`mailto:${email}`} className="text-emerald-100 hover:text-white transition">{email}</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-amber-500 mt-1" />
                  <div>
                    <span className="block text-xs text-emerald-100/40 uppercase tracking-wider mb-1">Atelier</span>
                    <span className="text-emerald-100">{address}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-emerald-100/40">
          <p>© {new Date().getFullYear()} Naturavya. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-amber-400 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber-400 transition">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
