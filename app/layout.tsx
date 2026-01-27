import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script" // 👈 Added Script Import
import "./globals.css"
import { CartProvider } from "@/app/context/cart-context"
import LayoutWrapper from "@/components/layout-wrapper"
import Providers from "./providers" 

// Import Navbar and Footer here (Server Side)
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer" 

const inter = Inter({ subsets: ["latin"] })

// 👇 UPDATED METADATA SECTION
export const metadata: Metadata = {
  metadataBase: new URL("https://naturavya.com"),
  title: "Naturavya Herbals",
  description: "Premium Ayurvedic Wellness",
  icons: { // 👈 Moved to root (Standard Next.js location)
    icon: "/icon.png", 
    apple: "/icon.png", 
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
        
        {/* 👇 1. Google Tag Manager Source */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-DLS6CBDJ89"
        />
        
        {/* 👇 2. Google Analytics Initialization */}
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-DLS6CBDJ89');
          `}
        </Script>

        <CartProvider>
          {/* 👇 Pass Navbar and Footer as props */}
          <LayoutWrapper 
            navbar={<Navbar />} 
            footer={<Footer />}
          >
          <Providers>
            {children}
          </Providers>
          </LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  )
}