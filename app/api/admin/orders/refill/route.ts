export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    console.error('WhatsApp refill error:', json);
    throw new Error('WhatsApp API error');
  }

  return json;
}

// GET → preview orders that are due for refill
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const { data: orders, error } = await supabase.rpc(
      'get_orders_due_for_refill',
      { p_limit: limit }
    );

    if (error) {
      console.error('get_orders_due_for_refill error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders for refill' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.error('GET /api/admin/orders/refill error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST → send WhatsApp refill reminders & update orders
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
    const limit = Number(body.limit || 50);

    const { data: orders, error } = await supabase.rpc(
      'get_orders_due_for_refill',
      { p_limit: limit }
    );

    if (error) {
      console.error('get_orders_due_for_refill error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders for refill' },
        { status: 500 }
      );
    }

    const targets = orders || [];
    const results: any[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const order of targets) {
      const phone: string | null =
        order.shipping_phone || order.customer_phone || order.phone;

      if (!phone) {
        failCount++;
        results.push({
          order_id: order.id,
          status: 'failed',
          reason: 'missing_phone',
        });
        continue;
      }

      const name: string =
        order.customer_name ||
        order.user_name ||
        order.shipping_first_name ||
        'ji';

      const due: string | null = order.refill_due_date;
      const dueText = due ? ` (refill due: ${due})` : '';

      const text =
        body.template ||
        `Namaste ${name},\n\nMain Naturavya se bol raha/rahi hoon. Aapne kuch time pehle humse Ayurvedic product liya tha${dueText}.\n\nCourse almost khatam hone wala hai. Agar aapko *same product ka refill* chahiye ho to iss message ka reply me *HI* likh dijiye, main aapko best combo & discount bata deta/deti hoon.\n\nIsse beech me gap nahi aayega aur results better milenge.\n\n– Team Naturavya`;

      let ok = false;
      try {
        await sendWhatsappText(phone, text);
        ok = true;
      } catch (e) {
        console.error('Refill WA send failed for order', order.id, e);
        ok = false;
      }

      if (ok) {
        successCount++;
      } else {
        failCount++;
      }

      const { error: updErr } = await supabase
        .from('orders')
        .update({
          refill_reminder_sent: ok,
          refill_reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updErr) {
        console.error('Refill order update error:', updErr);
      }

      results.push({
        order_id: order.id,
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
    console.error('POST /api/admin/orders/refill error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}