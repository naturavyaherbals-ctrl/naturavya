import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_CHANGE =
  Number(process.env.AI_AUTOPILOT_MAX_DAILY_CHANGE || 30);

export async function GET() {
  if (process.env.AI_AUTOPILOT_ENABLED !== 'true') {
    return NextResponse.json({ skipped: true });
  }

  const supabase = createAdminClient();

  const { data: ads, error } = await supabase
    .from('meta_ads_view')
    .select('*');

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const executed: any[] = [];

  for (const ad of ads || []) {
    let action: 'scale' | 'pause' | 'optimize' | null = null;

    // ❌ High RTO → PAUSE
    if (ad.rto_rate > 25) {
      action = 'pause';
    }

    // ❌ Bad CPL → REDUCE
    else if (ad.cost_per_lead > ad.target_cpl * 1.3) {
      action = 'optimize';
    }

    // ✅ Good CPL + conversions → SCALE
    else if (
      ad.cost_per_lead < ad.target_cpl &&
      ad.conversions >= 3
    ) {
      action = 'scale';
    }

    if (!action) continue;

    const budgetChange =
      action === 'scale'
        ? MAX_CHANGE
        : action === 'pause'
        ? -100
        : -MAX_CHANGE;

    await fetch(
      `https://graph.facebook.com/v19.0/${ad.adset_id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_budget:
            action === 'pause'
              ? 0
              : Math.max(
                  100,
                  Math.round(
                    ad.current_budget *
                      (1 + budgetChange / 100)
                  )
                ),
        }),
      }
    );

    await supabase.from('meta_autopilot_logs').insert({
      ad_id: ad.ad_id,
      action,
      old_budget: ad.current_budget,
      reason: {
        cpl: ad.cost_per_lead,
        rto: ad.rto_rate,
        conversions: ad.conversions,
      },
    });

    executed.push({
      ad_id: ad.ad_id,
      action,
    });
  }

  return NextResponse.json({
    executed: executed.length,
    details: executed,
  });
}
