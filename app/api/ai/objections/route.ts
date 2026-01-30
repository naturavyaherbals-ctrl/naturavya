export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getObjectionReply } from '@/lib/ai/objections';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { lead_id, objection } = await req.json();

    if (!lead_id || !objection) {
      return NextResponse.json(
        { error: 'lead_id and objection required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const reply = getObjectionReply(objection, lead);

    await supabase
      .from('leads')
      .update({
        ai_suggested_message: reply,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', lead_id);

    return NextResponse.json({
      success: true,
      message: reply,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to generate objection reply' },
      { status: 500 }
    );
  }
}
