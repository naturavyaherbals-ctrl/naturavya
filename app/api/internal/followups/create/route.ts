export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildFollowUps } from '@/lib/followups/schedule';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { lead_id, status } = await req.json();

    const supabase = createAdminClient();

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const followups = buildFollowUps(status);

    if (followups.length === 0) {
      return NextResponse.json({ success: true, created: 0 });
    }

    const rows = followups.map((f) => ({
      lead_id: lead.id,
      channel: f.channel,
      template: f.template,
      scheduled_at: f.scheduled_at,
      status: 'pending',
      attempts: 0,
    }));

    await supabase.from('followups').insert(rows);

    return NextResponse.json({ success: true, created: rows.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
