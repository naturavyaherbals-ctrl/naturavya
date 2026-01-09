import Link from "next/link"
import {
  Leaf,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ArrowRight
} from "lucide-react"
import { createClient } from "@/app/lib/supabase/server"

/* SEO STRATEGY: 
   We use specific keywords in the link text (Anchor Text) 
   so Google understands what the pages are about.
*/
const footerLinks = {
  categories: [
    { label: "Men's Wellness (Virya+)", href: "/categories/mens-wellness" },
    { label: "Breast Care (Maxx Boom)", href: "/categories/womens-wellness" },
    { label: "Joint Pain Relief", href: "/categories/general-health" },
    { label: "Intimate Wellness", href: "/categories/womens-wellness" },
    { label: "Piles Care (Null Pile)", href: "/categories/general-health" },
  ],
  popularProducts: [
    { label: "Maxx Boom Capsules", href: "/products/maxboom" },
    { label: "Virya Plus Vitality", href: "/products/virya-plus" },
    { label: "Zero Ache Oil", href: "/products/zeroache" },
    { label: "V-Stiff Gel", href: "/products/v-stiff" },
  ],
  company: [
    { label: "About Naturavya", href: "/about" },
    { label: "Customer Reviews", href: "/reviews" },
    { label: "Track Order", href: "/track-order" },
    { label: "Contact Support", href: "/contact" },
  ],
}

export default async function Footer() {
  const supabase = await createClient()

  // 1. Fetch settings from Database
  const { data: settings } = await supabase.from("settings").select("*")

  // 2. Helper to get value safely
  const getVal = (key: string, fallback: string) => 
    settings?.find(s => s.key === key)?.value || fallback

  // 3. Get dynamic values (With INDORE Fallbacks for Local SEO)
  const phone = getVal("phone", "+91 7222959340")
  const email = getVal("support_email", "support@naturavya.com")
  const address = getVal("address", "Gopal Nivas, Bada Ganpati, Indore, MP 452001")
  
  // Clean phone number for WhatsApp link
  const cleanPhone = phone.replace(/[^0-9]/g, '')

  const socialLinks = [
    { icon: Phone, url: `tel:${phone}`, label: "Call Us" },
    { icon: MessageCircle, url: `https://wa.me/${cleanPhone}`, label: "WhatsApp" },
    { icon: Instagram, url: getVal("instagram", "#"), label: "Instagram" },
    { icon: Facebook, url: getVal("facebook", "#"), label: "Facebook" },
  ]

  return (
    <footer className="bg-[#1a3c34] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* 1. Brand Section (Span 4) */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#d4a373] transition-colors">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Naturavya</span>
            </Link>

            <p className="text-gray-300 leading-relaxed mb-8 max-w-sm">
              Indore's trusted Ayurvedic brand. We formulate 100% safe, herbal solutions 
              for vitality, joint pain, and personal wellness using ancient Vedic wisdom.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#d4a373] hover:border-[#d4a373] hover:text-white transition-all duration-300"
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Categories (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-[#d4a373]">Shop By Goal</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white hover:pl-1 transition-all text-sm flex items-center gap-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Popular Products (Span 2) - GREAT FOR SEO */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-lg mb-6 text-[#d4a373]">Best Sellers</h4>
            <ul className="space-y-3">
              {footerLinks.popularProducts.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white hover:pl-1 transition-all text-sm flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3 opacity-50" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact Info (Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-lg mb-6 text-[#d4a373]">Contact Us</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d4a373] shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm leading-relaxed">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4a373] shrink-0" />
                <a href={`tel:${phone}`} className="text-gray-300 hover:text-white text-sm">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d4a373] shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-300 hover:text-white text-sm">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Naturavya Herbals. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

