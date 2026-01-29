import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // e.g. 123456789012345

export async function POST(req: NextRequest) {
  try {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp env vars not configured' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const to = body.to as string | undefined;
    const text = body.text as string | undefined;

    if (!to || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing "to" or "text"' },
        { status: 400 }
      );
    }

    // Normalize Indian numbers if needed (very basic)
    let toNumber = to.replace(/\D/g, '');
    if (toNumber.length === 10) {
      toNumber = '91' + toNumber;
    }

    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const waRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'text',
        text: {
          body: text,
        },
      }),
    });

    const waJson = await waRes.json();

    if (!waRes.ok) {
      console.error('WhatsApp API error:', waJson);
      return NextResponse.json(
        { success: false, error: 'WhatsApp API error', details: waJson },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: waJson });
  } catch (err: any) {
    console.error('WhatsApp send error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}