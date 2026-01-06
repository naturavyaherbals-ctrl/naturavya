"use client"

import { usePathname } from "next/navigation"

export default function LayoutWrapper({ 
  children,
  navbar,
  footer
}: { 
  children: React.ReactNode
  navbar: React.ReactNode
  footer: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Check if we are on an admin page
  const isAdmin = pathname.startsWith("/admin")

  return (
    <>
      {/* Show Navbar only if NOT admin */}
      {!isAdmin && navbar}
      
      {children}
      
      {/* Show Footer only if NOT admin */}
      {!isAdmin && footer} 
    </>
  )
}
