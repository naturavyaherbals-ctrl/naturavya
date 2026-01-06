import './globals.css'
import { Inter } from 'next/font/google'

// 1. COMPONENT IMPORTS
// (If your folders are different, you might need to adjust these, 
// but based on your errors, these seem to be the standard paths)
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

// 2. CART PROVIDER IMPORT
// We know this path is correct now:
import { CartProvider } from '@/app/context/cart-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Naturavya Herbals',
  description: 'Ancient Wisdom meets Modern Alchemy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 3. THE WRAPPER MUST BE HERE */}
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}