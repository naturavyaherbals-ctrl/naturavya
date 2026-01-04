import { supabaseServer } from "@/app/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateSettings } from "./actions" // Import the action we just made

export default async function SettingsPage() {
  const supabase = await supabaseServer()
  
  // 1. Fetch existing settings so we can show them in the boxes
  const { data: settings } = await supabase.from("settings").select("*")

  // Helper to find the value for a specific key
  const getValue = (key: string) => settings?.find(s => s.key === key)?.value || ""

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Manage your contact details and social links.</p>
      </div>

      <form action={updateSettings} className="grid gap-6 p-6 border rounded-lg bg-card">
        
        {/* General Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input name="store_name" defaultValue={getValue('store_name')} placeholder="Naturavya Herbals" />
          </div>
          
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input name="support_email" defaultValue={getValue('support_email')} placeholder="support@naturavya.com" />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input name="phone" defaultValue={getValue('phone')} placeholder="+91 98765 43210" />
          </div>
          
          <div className="space-y-2">
             <Label>Instagram Link</Label>
             <Input name="instagram" defaultValue={getValue('instagram')} placeholder="https://instagram.com/..." />
          </div>

          <div className="space-y-2">
             <Label>Facebook Link</Label>
             <Input name="facebook" defaultValue={getValue('facebook')} placeholder="https://facebook.com/..." />
          </div>
        </div>

        {/* Address (New Field) */}
        <div className="space-y-2">
          <Label>Store Address</Label>
          <Textarea 
            name="address" 
            defaultValue={getValue('address')} 
            placeholder="e.g. 123 Wellness Street, Mumbai, India" 
            rows={3}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" size="lg">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}