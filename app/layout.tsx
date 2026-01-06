import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/app/context/cart-context"
import LayoutWrapper from "@/components/layout-wrapper" 

// Import Navbar and Footer here (Server Side)
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer" 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Naturavya Herbals",
  description: "Premium Ayurvedic Wellness",
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