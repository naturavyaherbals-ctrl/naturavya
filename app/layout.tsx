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
  metadataBase: new URL("https://naturavya.com"), // Ensure this matches your live domain
  title: "Naturavya Herbals",
  description: "Premium Ayurvedic Wellness",
  
  // 👇 PASTE YOUR GOOGLE CODE BELOW
  verification: {
    google: "PASTE_YOUR_GOOGLE_CODE_HERE", 
    <meta name="google-site-verification" content="dIYWKbaKKkRpQrYA__KIgt0SD_H0LMmBLqodAsAt0bk" />
  },

  openGraph: {
    title: "Naturavya Herbals",
    description: "Premium Ayurvedic Wellness",
    url: "https://naturavya.com",
    siteName: "Naturavya",
    locale: "en_IN",
    type: "website",
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
