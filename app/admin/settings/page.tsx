import { supabaseServer } from "@/app/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function SettingsPage() {
  const supabase = await supabaseServer()
  const { data: settings } = await supabase.from("settings").select("*")

  // Helper to find value
  const getValue = (key: string) => settings?.find(s => s.key === key)?.value || ""

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store details and preferences.</p>
      </div>

      <div className="grid gap-6 p-6 border rounded-lg bg-card">
        <div className="space-y-2">
          <Label>Store Name</Label>
          <Input defaultValue={getValue('store_name')} placeholder="e.g. Naturavya" />
        </div>
        
        <div className="space-y-2">
          <Label>Support Email</Label>
          <Input defaultValue={getValue('support_email')} placeholder="support@example.com" />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input defaultValue="+91 98765 43210" />
        </div>

        <Button className="w-fit">Save Changes</Button>
      </div>
    </div>
  )
}