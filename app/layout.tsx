import './globals.css'
import { Inter } from 'next/font/google'

// 1. MAKE SURE THESE COMPONENT IMPORTS ARE HERE
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

// 2. YOUR CART PROVIDER IMPORT
import { CartProvider } from '@/lib/cart/cart-context'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}