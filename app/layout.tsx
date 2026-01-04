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
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. WRAP EVERYTHING INSIDE CARTPROVIDER */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}