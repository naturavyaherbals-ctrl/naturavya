import { redirect } from "next/navigation"
import { createClient } from "@/app/lib/supabase/server"
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, ArrowLeft, Mail, Sparkles } from "lucide-react"
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
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 relative overflow-hidden text-emerald-950 selection:bg-amber-100 selection:text-amber-900">
      
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        
        {/* Back Link */}
        <Link href="/account" className="inline-flex items-center gap-2 text-emerald-800/60 hover:text-emerald-900 hover:pl-2 transition-all mb-8 font-medium text-sm uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" /> Return to Sanctuary
        </Link>

        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          
          {/* Gold Top Border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300" />

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-serif text-emerald-950 mb-2">Refine Your Profile</h1>
            <p className="text-emerald-800/60 font-light">Update your personal details for a tailored experience.</p>
          </div>

          <form action={updateProfile} className="space-y-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Full Name</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-focus-within:bg-amber-100 group-focus-within:text-amber-600">
                   <User className="h-4 w-4" />
                </div>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  defaultValue={currentName} 
                  className="pl-14 h-12 bg-white/50 border-emerald-100/50 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all text-emerald-900" 
                  placeholder="John Doe" 
                  required 
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Email Address</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                   <Mail className="h-4 w-4" />
                </div>
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                  className="pl-14 h-12 bg-gray-50/50 border-gray-100 text-gray-500 cursor-not-allowed rounded-xl" 
                />
              </div>
              <p className="text-[10px] text-emerald-800/40 text-right flex items-center justify-end gap-1">
                <Sparkles size={10} /> Verified Identity
              </p>
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Phone Number</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-focus-within:bg-amber-100 group-focus-within:text-amber-600">
                   <Phone className="h-4 w-4" />
                </div>
                <Input 
                  id="phone" 
                  name="phone" 
                  className="pl-14 h-12 bg-white/50 border-emerald-100/50 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all text-emerald-900" 
                  placeholder="+91 98765 43210" 
                />
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 transition-all" asChild>
                <Link href="/account">Discard</Link>
              </Button>
              <Button type="submit" className="flex-1 h-12 rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 shadow-lg hover:shadow-emerald-900/20 transition-all font-bold">
                Save Changes
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}