export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/*
 Meta Lead Ads Webhook
 Saves: phone, name, ad_id, campaign_name, form_id, raw_data
*/
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    // Meta sends entries array
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value || !value.leadgen_id) {
      return NextResponse.json({ success: true });
    }

    const leadData = value.leadgen_data || [];
    const getField = (name: string) =>
      leadData.find((f: any) => f.name === name)?.values?.[0] || null;

    const phone =
      getField('phone_number') ||
      getField('phone') ||
      getField('mobile');

    if (!phone) {
      return NextResponse.json({ success: true });
    }

    const full_name =
      getField('full_name') ||
      `${getField('first_name') || ''} ${getField('last_name') || ''}`.trim();

    const ad_id = value.ad_id || null;
    const campaign_name = value.campaign_name || null;
    const form_id = value.form_id || null;
    const adset_id = value.adset_id || null;

    // Check duplicate by phone
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existing) {
      // Update existing lead
      await supabase
        .from('leads')
        .update({
          full_name,
          ad_id,
          adset_id,
          campaign_name,
          form_id,
          source: 'meta',
          raw_data: value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      return NextResponse.json({ success: true, updated: true });
    }

    // Insert new lead
    await supabase.from('leads').insert({
      full_name,
      phone,
      source: 'meta',
      ad_id,
      adset_id,
      campaign_name,
      form_id,
      status: 'new',
      raw_data: value,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, inserted: true });
  } catch (e) {
    console.error('Meta webhook error', e);
    return NextResponse.json(
      { error: 'Meta webhook failed' },
      { status: 500 }
    );
  }
}
