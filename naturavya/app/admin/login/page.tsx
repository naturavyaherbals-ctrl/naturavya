"use client"

import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const login = async () => {
    document.cookie = "admin-auth=true; path=/"
    window.location.href = "/admin"
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 border rounded-xl w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <Button className="w-full" onClick={login}>
          Login as Admin
        </Button>
      </div>
    </div>
  )
}
