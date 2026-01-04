import './globals.css'
import { Inter } from 'next/font/google'

// 1. IMPORT THE PROVIDER (Check your exact path, it might be different)
import { CartProvider } from '@/lib/cart/cart-context'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ CORRECT
return (
  <html lang="en">
    <body className={inter.className}>
      <CartProvider>  {/* <--- START TAG HERE */}
        <Navbar />
        {children}
        <Footer />
      </CartProvider> {/* <--- END TAG HERE */}
    </body>
  </html>
)
}