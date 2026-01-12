import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/app/context/cart-context"
import LayoutWrapper from "@/components/layout-wrapper" 

// Import Navbar and Footer here (Server Side)
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer" 

const inter = Inter({ subsets: ["latin"] })

// 👇 UPDATED METADATA SECTION
export const metadata: Metadata = {
  metadataBase: new URL("https://naturavya.com"), // 👈 REPLACE with your actual domain if different
  title: "Naturavya Herbals",
  description: "Premium Ayurvedic Wellness",
  openGraph: {
    title: "Naturavya Herbals",
    description: "Premium Ayurvedic Wellness",
    url: "https://naturavya.com",
    siteName: "Naturavya",
    locale: "en_IN",
    type: "website",
    icons: {
    icon: "/icon.png", // This tells browsers/Google where the icon is
    apple: "/icon.png", // This is for iPhone/iPad home screen shortcuts
  },
    // Next.js automatically detects opengraph-image.tsx, 
    // but defining metadataBase above is required for it to work.
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {/* 👇 Pass Navbar and Footer as props */}
          <LayoutWrapper 
            navbar={<Navbar />} 
            footer={<Footer />}
          >
            {children}
          </LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  )
}