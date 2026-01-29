import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendWhatsappText(toRaw: string, text: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp env vars not configured');
  }

  let to = toRaw.replace(/\D/g, '');
  if (to.length === 10) {
    to = '91' + to;
  }

  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('WhatsApp revive error:', json);
    throw new Error('WhatsApp API error');
  }

  return json;
}

// GET → preview which leads will be revived
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { data: leads, error } = await supabase.rpc(
      'get_dead_leads_for_revival',
      { p_limit: limit }
    );

    if (error) {
      console.error('get_dead_leads_for_revival error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leads for revival' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, leads: leads || [] });
  } catch (err: any) {
    console.error('GET /api/admin/leads/revive error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST → actually send revival WhatsApp & update leads
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const limit = Number(body.limit || 20);
    const campaign =
      (body.campaign as string | undefined) || 'dead_whatsapp_v1';

    const { data: leads, error } = await supabase.rpc(
      'get_dead_leads_for_revival',
      { p_limit: limit }
    );

    if (error) {
      console.error('get_dead_leads_for_revival error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leads for revival' },
        { status: 500 }
      );
    }

    const targets = leads || [];
    const results: any[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const lead of targets) {
      if (!lead.phone) {
        failCount++;
        results.push({
          lead_id: lead.id,
          status: 'failed',
          reason: 'missing_phone',
        });
        // still increment attempts
        await supabase
          .from('leads')
          .update({
            revival_status: 'failed',
            revival_attempts: (lead.revival_attempts || 0) + 1,
            revival_last_sent_at: new Date().toISOString(),
            revival_campaign: campaign,
          })
          .eq('id', lead.id);
        continue;
      }

      const name = lead.full_name || 'ji';
      const text =
        body.template ||
        `Namaste ${name},\n\nMain Naturavya (Ayurvedic brand) se bol raha/rahi hoon. Aapne pehle humare products ke baare me enquiry ki thi.\n\nAbhi hum limited time ke liye special follow-up kar rahe hain. Agar aapko still ${lead.interested_categories?.[0] || 'apni health issue'} ke liye solution chahiye ho toh reply me *HI* likh dijiye, main aapko best combo aur discount bata deta/deti hoon.\n\nAgar abhi nahi chahiye toh ignore kar sakte ho 🙂\n\n– Team Naturavya`;

      let ok = false;
      try {
        await sendWhatsappText(lead.phone, text);
        ok = true;
      } catch (e) {
        console.error('Revive WA send failed for lead', lead.id, e);
        ok = false;
      }

      if (ok) {
        successCount++;
      } else {
        failCount++;
      }

      const { error: updErr } = await supabase
        .from('leads')
        .update({
          revival_status: ok ? 'sent' : 'failed',
          revival_attempts: (lead.revival_attempts || 0) + 1,
          revival_last_sent_at: new Date().toISOString(),
          revival_campaign: campaign,
        })
        .eq('id', lead.id);

      if (updErr) {
        console.error('Revive lead update error:', updErr);
      }

      results.push({
        lead_id: lead.id,
        status: ok ? 'sent' : 'failed',
      });
    }

    return NextResponse.json({
      success: true,
      processed: targets.length,
      successCount,
      failCount,
      results,
    });
  } catch (err: any) {
    console.error('POST /api/admin/leads/revive error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}