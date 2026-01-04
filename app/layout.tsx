import "./globals.css"
// Ensure this path matches exactly where you created the file
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
        {/* The Provider MUST wrap everything inside body */}
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
