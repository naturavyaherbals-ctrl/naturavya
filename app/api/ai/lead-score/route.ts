import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { scoreLead } from '@/lib/ai/lead-scoring';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { lead_id } = await req.json();
    if (!lead_id) {
      return NextResponse.json(
        { error: 'lead_id required' },
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

    const result = scoreLead(lead);

    await supabase
      .from('leads')
      .update({
        score: result.score,
        temperature: result.temperature,
        ai_insights: result.reason,
        ai_suggested_action: result.suggested_action,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead_id);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Lead scoring failed' },
      { status: 500 }
    );
  }
}
