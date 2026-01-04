"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginAction } from "./action"

export default function AdminLoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    
    // Call the server action we created in Step 2
    const result = await loginAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If success, the action handles the redirect automatically
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 border bg-white shadow-xl rounded-xl w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-gray-500 mb-6 text-sm">Enter your credentials to access the dashboard</p>
        
        <form action={handleSubmit} className="space-y-4">
          <Input 
            name="email" 
            type="email" 
            placeholder="admin@naturavya.com" 
            required 
          />
          
          <Input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
          />

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  )
}