"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { logoutAdmin } from "./actions"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Star,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Leaf,
  Sparkles,
  ImageIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Promotions", href: "/admin/promotions", icon: Sparkles },
  { name: "Website Images", href: "/admin/website-images", icon: ImageIcon },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-muted/30">
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transition-transform lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Naturavya</span>
            <Badge className="ml-auto">Admin</Badge>
          </div>

          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                    active
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="lg:pl-64">
          <header className="h-16 bg-card border-b flex items-center px-4 gap-4">
  <Button
    size="icon"
    variant="ghost"
    className="lg:hidden"
    onClick={() => setSidebarOpen(true)}
  >
    <Menu />
  </Button>

  <div className="relative flex-1 max-w-md">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input className="pl-9" placeholder="Search..." />
  </div>

  {mounted && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <User className="h-4 w-4 mr-2" />
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Admin</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
  className="text-destructive"
  onClick={async () => {
    await fetch("/admin/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }}
>
  Logout
</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}
</header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </Suspense>
  )
}
