import "./globals.css"
import { CartProvider } from "@/app/lib/cart/cart-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export const metadata = {
  title: "Naturavya Herbals",
  description: "Pure Ayurvedic Wellness for India",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {/* Navbar appears on EVERY page now */}
          <Navbar />
          
          {children}
          
          {/* Footer appears on EVERY page now */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
