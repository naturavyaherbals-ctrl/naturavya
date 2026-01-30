import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchMetaInsights } from '@/lib/meta/insights';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const secret = req.headers.get('x-cron-secret');
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = process.env.META_ACCESS_TOKEN!;
    const adAccountId = process.env.META_AD_ACCOUNT_ID!;

    if (!accessToken || !adAccountId) {
      throw new Error('Meta credentials missing');
    }

    const supabase = createAdminClient();

    const date = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10); // yesterday (YYYY-MM-DD)

    const insights = await fetchMetaInsights(
      accessToken,
      adAccountId,
      date
    );

    let saved = 0;

    for (const row of insights) {
      const { error } = await supabase
        .from('meta_ad_spend')
        .upsert(
          {
            ad_id: row.ad_id,
            adset_id: row.adset_id,
            campaign_id: row.campaign_id,
            date,
            spend: row.spend,
            impressions: row.impressions,
            clicks: row.clicks,
          },
          { onConflict: 'ad_id,date' }
        );

      if (!error) saved++;
    }

    return NextResponse.json({
      success: true,
      date,
      rows_saved: saved,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Meta insights cron failed' },
      { status: 500 }
    );
  }
}
