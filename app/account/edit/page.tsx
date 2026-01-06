import { redirect } from "next/navigation"
import { createClient } from "@/app/lib/supabase/server"
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditProfilePage() {
  const supabase = await createClient()
  
  // 1. Get current user data
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const currentName = user.user_metadata?.full_name || ""
  const email = user.email || ""

  return (
    <div className="max-w-xl mx-auto px-4 py-24 min-h-screen">
      
      {/* Back Button */}
      <Link href="/account" className="flex items-center text-gray-500 hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Account
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Edit Profile</h1>
          <p className="text-gray-500">Update your personal information</p>
        </div>

        <form action={updateProfile} className="space-y-6">
          
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                id="fullName" 
                name="fullName" 
                defaultValue={currentName} 
                className="pl-10" 
                placeholder="John Doe" 
                required 
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              value={email} 
              disabled 
              className="bg-gray-50 text-gray-500 cursor-not-allowed" 
            />
            <p className="text-xs text-gray-400">Email cannot be changed.</p>
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                id="phone" 
                name="phone" 
                className="pl-10" 
                placeholder="+91 98765 43210" 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link href="/account">Cancel</Link>
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}