export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateMetaAdBudget } from '@/lib/meta/budget';

export const runtime = 'nodejs';

/*
 Body:
 {
   ad_id,
   adset_id,
   action,
   current_budget,
   suggested_budget
 }
*/
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      ad_id,
      adset_id,
      action,
      current_budget,
      suggested_budget,
    } = body;

    if (!ad_id || !adset_id) {
      return NextResponse.json(
        { error: 'Missing ad_id or adset_id' },
        { status: 400 }
      );
    }

    // HARD SAFETY CAP (₹10,000/day)
    if (suggested_budget > 10000) {
      return NextResponse.json(
        { error: 'Budget exceeds safety cap' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Log intent
    const { data: log } = await supabase
      .from('meta_budget_actions')
      .insert({
        ad_id,
        campaign_name: body.campaign_name,
        action,
        old_budget: current_budget,
        new_budget: suggested_budget,
      })
      .select()
      .single();

    const accessToken = process.env.META_ACCESS_TOKEN!;
    if (!accessToken) throw new Error('Meta token missing');

    // EXECUTE META API WRITE
    await updateMetaAdBudget(
      accessToken,
      adset_id,
      suggested_budget
    );

    // Mark executed
    await supabase
      .from('meta_budget_actions')
      .update({
        executed: true,
        executed_at: new Date().toISOString(),
      })
      .eq('id', log.id);

    return NextResponse.json({
      success: true,
      executed: true,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
