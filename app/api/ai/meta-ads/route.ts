import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { decideAdPerformance } from '@/lib/ai/ad-decision';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: ads } = await supabase
      .from('meta_ads_view')
      .select('*');

    if (!ads || ads.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const decisions = ads.map((ad: any) => {
      const decision = decideAdPerformance(ad);
      return {
        ad_id: ad.ad_id,
        campaign: ad.campaign_name,
        product: ad.product,
        ...decision,
      };
    });

    return NextResponse.json({
      success: true,
      decisions,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Meta AI decision failed' },
      { status: 500 }
    );
  }
}
