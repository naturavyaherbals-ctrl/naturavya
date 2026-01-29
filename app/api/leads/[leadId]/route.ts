// app/api/admin/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: { id: string };
}

/**
 * PATCH /api/admin/leads/[id]
 * Partial update of a lead + AI rescore + optional follow-up scheduling
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const leadId = context.params.id;

  try {
    const supabase = await createServerSupabaseClient();

    // 1. Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Team member
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    const normalizedRole = member?.role
      ?.toLowerCase()
      .replace(/\s+/g, '_');

    // 3. Fetch existing lead
    const { data: existingLead, error: existingError } = await supabase
      .from('leads')
      .select('id, assigned_to, status, temperature, score')
      .eq('id', leadId)
      .single();

    if (existingError || !existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 },
      );
    }

    // 4. Agents can only update their own assigned leads
    if (
      normalizedRole === 'agent' &&
      member?.id &&
      existingLead.assigned_to !== member.id
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const updates: Record<string, any> = { ...body };

    // 5. Prevent agents from reassigning leads manually
    if (normalizedRole === 'agent' && 'assigned_to' in updates) {
      delete updates.assigned_to;
    }

    // 6. Apply update (DB trigger will recalc score/temperature)
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .select('*')
      .single();

    if (updateError || !updatedLead) {
      console.error('Lead update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: updateError?.message || 'Update failed',
        },
        { status: 400 },
      );
    }

    // 7. Re-trigger AI scorer to refresh ai_insights/suggestions
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-lead-scorer`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lead_id: updatedLead.id }),
        },
      ).catch((err) =>
        console.error('Error calling ai-lead-scorer (PATCH):', err),
      );
    }

    // 8. (Optional) schedule follow-ups when status changes
    try {
      const prevStatus = existingLead.status;
      const newStatus = updates.status ?? prevStatus;

      if (newStatus !== prevStatus) {
        // Map status change to trigger_event
        // Customize as needed for your follow_up_sequences.trigger_event
        const triggerEventMap: Record<string, string> = {
          not_picked: 'no_response',
          follow_up: 'no_response',
          callback: 'callback_due',
        };

        const triggerEvent = triggerEventMap[newStatus];

        if (triggerEvent) {
          const temperature =
            updatedLead.temperature ||
            (updatedLead.score >= 75
              ? 'hot'
              : updatedLead.score >= 45
              ? 'warm'
              : 'cold');

          const { data: sequences, error: seqError } = await supabase
            .from('follow_up_sequences')
            .select('*')
            .eq('trigger_event', triggerEvent)
            .or(`temperature.eq.${temperature},temperature.is.null`)
            .eq('is_active', true);

          if (seqError) {
            console.error('Error loading follow_up_sequences (PATCH):', seqError);
          } else if (sequences && sequences.length > 0) {
            const now = Date.now();
            const followUps = sequences.map((seq) => ({
              lead_id: updatedLead.id,
              sequence_id: seq.id,
              scheduled_at: new Date(
                now + (seq.delay_minutes || 0) * 60_000,
              ).toISOString(),
              channel: seq.channel || 'whatsapp',
              status: 'pending',
            }));

            await supabase.from('scheduled_follow_ups').insert(followUps);
          }
        }
      }
    } catch (err) {
      console.error('Error scheduling follow-ups (PATCH):', err);
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedLead,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error('Critical crash in /api/admin/leads/[id] PATCH:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}