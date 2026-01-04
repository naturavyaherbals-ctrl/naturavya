import Link from "next/link"
import {
  Leaf,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { supabaseServer } from "@/app/lib/supabase/server"

const footerLinks = {
  shop: [
    { label: "Men's Wellness", href: "/categories/mens-wellness" },
    { label: "Women's Wellness", href: "/categories/womens-wellness" },
    { label: "General Health", href: "/categories/general-health" },
    { label: "Intimate Oils", href: "/categories/intimate-oils" },
    { label: "Supplements", href: "/categories/supplements" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about#story" },
    { label: "Reviews", href: "/reviews" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/contact" },
  ],
}

export default async function Footer() {
  const supabase = await supabaseServer()

  // 1. Fetch settings from Database
  const { data: settings } = await supabase.from("settings").select("*")

  // 2. Helper to get value safely
  const getVal = (key: string, fallback: string) => 
    settings?.find(s => s.key === key)?.value || fallback

  // 3. Get dynamic values
  const phone = getVal("phone", "+91 98765 43210")
  const email = getVal("support_email", "hello@naturavya.com")
  const address = getVal("address", "Mumbai, Maharashtra, India")
  
  const socialLinks = [
    { icon: Instagram, url: getVal("instagram", "#") },
    { icon: Facebook, url: getVal("facebook", "#") },
    { icon: Twitter, url: getVal("twitter", "#") },
    { icon: Youtube, url: getVal("youtube", "#") },
  ]

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-semibold">Naturavya</span>
            </Link>

            <p className="text-background/70 leading-relaxed mb-6 max-w-sm">
              Embracing the ancient wisdom of Ayurveda to bring you premium
              natural wellness solutions for modern life.
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (Dynamic!) */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href={`mailto:${email}`} className="text-background/70 hover:text-primary transition">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href={`tel:${phone}`} className="text-background/70 hover:text-primary transition">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-background/70">
                  {address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} Naturavya. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
             <Link href="/admin" className="text-sm text-background/50 hover:text-primary">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
