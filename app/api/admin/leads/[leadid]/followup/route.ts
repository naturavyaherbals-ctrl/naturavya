export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const leadId = params.id;

    const { type } = await req.json(); // follow_up | not_picked | revival

    const delayMap: any = {
      follow_up: 24,
      not_picked: 6,
      revival: 72,
    };

    const hours = delayMap[type] || 24;
    const scheduledAt = new Date(
      Date.now() + hours * 60 * 60 * 1000
    ).toISOString();

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const message = `Namaste ${lead.full_name || 'ji'} 🙏  
Naturavya se follow-up kar rahe hain.  
Aapko koi guidance chahiye ho to please bataiye 🙂`;

    await supabase.from('followups').insert({
      lead_id: leadId,
      channel: 'whatsapp',
      status: 'pending',
      scheduled_at: scheduledAt,
      message,
      attempts: 0,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    );
  }
}
