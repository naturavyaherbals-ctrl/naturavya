import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsAppText } from '@/lib/whatsapp/send';
import { getFollowUpMessage } from '@/lib/followups/templates';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = createAdminClient();

  const { data: followups } = await supabase
    .from('followups')
    .select('*, leads(*)')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .limit(20);

  for (const f of followups || []) {
    try {
      const message = getFollowUpMessage(f.template, f.leads);
      if (!message) continue;

      await sendWhatsAppText({
        to: f.leads.phone,
        message,
      });

      await supabase
        .from('followups')
        .update({
          status: 'sent',
          executed_at: new Date().toISOString(),
          attempts: f.attempts + 1,
        })
        .eq('id', f.id);

      await supabase
        .from('leads')
        .update({
          whatsapp_responses: (f.leads.whatsapp_responses || 0) + 1,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', f.leads.id);
    } catch (e: any) {
      await supabase
        .from('followups')
        .update({
          attempts: f.attempts + 1,
          last_error: e.message,
        })
        .eq('id', f.id);
    }
  }

  return NextResponse.json({ success: true });
}
