export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const leadId = context.params.id;

  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // role gate (same rule as PATCH)
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    const normalizedRole = member?.role?.toLowerCase().replace(/\s+/g, '_');

    const { data: lead } = await supabase
      .from('leads')
      .select('id, assigned_to')
      .eq('id', leadId)
      .single();

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    if (normalizedRole === 'agent' && member?.id && lead.assigned_to !== member.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { activity_type, description, notes, outcome } = body;

    if (!activity_type) {
      return NextResponse.json({ success: false, error: 'activity_type required' }, { status: 400 });
    }

    const { data: inserted, error: insErr } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        activity_type,
        description: description ?? null,
        notes: notes ?? null,
        outcome: outcome ?? null,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (insErr || !inserted) {
      return NextResponse.json({ success: false, error: insErr?.message || 'Insert failed' }, { status: 400 });
    }

    // Keep lead “fresh”
    await supabase
      .from('leads')
      .update({
        last_activity_at: new Date().toISOString(),
        last_contacted_at: ['call', 'whatsapp', 'email'].includes(activity_type)
          ? new Date().toISOString()
          : undefined,
      })
      .eq('id', leadId);

    return NextResponse.json({ success: true, data: inserted });
  } catch (err: any) {
    console.error('Crash in POST /api/admin/leads/[id]/activities:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}