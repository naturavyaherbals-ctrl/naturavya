import { redirect } from "next/navigation"
import { createClient } from "@/app/lib/supabase/server"
import { signout } from "@/app/login/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Package, LogOut } from "lucide-react"

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get User Name from metadata or fallback to email
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0]

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <form action={signout}>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">{userName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
           <Link href="/account/edit">Edit Profile</Link>
          </Button>
        </div>

        {/* Orders Area */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order History
          </h2>
          
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            <p>No orders found.</p>
            <Button variant="link" className="text-primary" asChild>
                <a href="/categories">Start Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}