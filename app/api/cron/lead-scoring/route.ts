import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { scoreLead } from '@/lib/ai/lead-scoring';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const secret = req.headers.get('x-cron-secret');
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .neq('status', 'converted')
      .limit(200);

    let processed = 0;

    for (const lead of leads || []) {
      const result = scoreLead(lead);

      await supabase
        .from('leads')
        .update({
          score: result.score,
          temperature: result.temperature,
          ai_insights: result.reason,
          ai_suggested_action: result.suggested_action,
        })
        .eq('id', lead.id);

      processed++;
    }

    return NextResponse.json({ success: true, processed });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Bulk scoring failed' },
      { status: 500 }
    );
  }
}
