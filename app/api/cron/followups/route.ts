import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('x-cron-secret');
    if (auth !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const now = new Date().toISOString();

    const { data: followups } = await supabase
      .from('followups')
      .select('*, leads(*)')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .limit(20);

    if (!followups || followups.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    let sent = 0;

    for (const f of followups) {
      const lead = f.leads;
      if (!lead?.phone) continue;

      const message =
        f.message ||
        `Namaste ${lead.full_name || 'ji'} 🙏  
Naturavya se follow-up kar rahe hain.  
Agar aapko koi doubt ho ya help chahiye ho, please bataye 🙂`;

      const waRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: lead.phone,
            text: message,
          }),
        }
      );

      if (!waRes.ok) {
        await supabase
          .from('followups')
          .update({
            status: 'failed',
            attempts: f.attempts + 1,
            last_error: 'WhatsApp send failed',
          })
          .eq('id', f.id);
        continue;
      }

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
          last_activity_at: new Date().toISOString(),
          engagement_score: (lead.engagement_score || 0) + 5,
        })
        .eq('id', lead.id);

      sent++;
    }

    return NextResponse.json({ success: true, processed: sent });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Follow-up cron failed' },
      { status: 500 }
    );
  }
}
