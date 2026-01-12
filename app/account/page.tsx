import { redirect } from "next/navigation"
import { createClient } from "@/app/lib/supabase/server"
import { signout } from "@/app/login/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Package, LogOut, Crown, Sparkles, MapPin, Mail, ArrowRight } from "lucide-react"

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-emerald-950 relative overflow-hidden selection:bg-amber-100 selection:text-amber-900 pt-32 pb-20">
      
      {/* --- BACKGROUND AMBIENCE (CSS 3D Effect) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-200/50 shadow-sm mb-3">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-800 tracking-[0.2em] uppercase">Legacy Member</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-emerald-950">
              Welcome, <span className="italic text-amber-600">{userName}</span>
            </h1>
          </div>

          <form action={signout}>
            <Button variant="outline" className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all rounded-xl px-6">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* --- LEFT: PROFILE CARD (Glassmorphism) --- */}
          <div className="md:col-span-4">
            <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-8 relative overflow-hidden group">
              {/* Decorative Gradient Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300" />
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-white border-2 border-amber-100 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/5 group-hover:scale-105 transition-transform duration-500">
                  <User className="w-10 h-10 text-emerald-700" />
                </div>
                
                <h2 className="text-2xl font-serif text-emerald-950 mb-1">{userName}</h2>
                <div className="flex items-center gap-2 text-emerald-800/60 text-sm mb-8">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>

                <div className="w-full space-y-3">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-amber-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 transition-all flex justify-between group/btn" asChild>
                    <Link href="/account/edit">
                      <span>Edit Profile</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full h-12 rounded-xl text-emerald-800/70 hover:bg-emerald-50/50 hover:text-emerald-900 justify-between group/btn">
                    <span>Addresses</span>
                    <MapPin className="w-4 h-4 text-emerald-300 group-hover/btn:text-emerald-500 transition-colors" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: ORDER HISTORY --- */}
          <div className="md:col-span-8">
            <div className="bg-white/80 backdrop-blur-md border border-amber-100/50 shadow-lg rounded-[2.5rem] p-8 h-full">
              <h2 className="text-xl font-serif text-emerald-950 mb-8 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-full">
                  <Package className="w-5 h-5 text-emerald-700" />
                </div>
                Purchase History
              </h2>
              
              {/* Empty State */}
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-emerald-900/5 rounded-3xl bg-[#fbfbfb]/50">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900 mb-2">No Orders Yet</h3>
                <p className="text-emerald-800/50 max-w-sm mb-6 text-sm leading-relaxed">
                  Your journey to holistic wellness begins with a single step. Explore our curated elixirs.
                </p>
                <Button className="bg-emerald-900 text-white hover:bg-emerald-800 rounded-full px-8 shadow-lg shadow-emerald-900/20" asChild>
                  <Link href="/categories">Visit Apothecary</Link>
                </Button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}