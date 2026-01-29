import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay env vars not configured' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const phone = body.phone as string | undefined;
    const name = (body.name as string | undefined) || 'Customer';
    const referenceId =
      (body.reference_id as string | undefined) ||
      (body.leadId as string | undefined) ||
      `lead_${Date.now()}`;
    const amountRupees =
      typeof body.amount === 'number' ? body.amount : Number(body.amount || 1);

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Missing phone' },
        { status: 400 }
      );
    }

    const amountPaise = Math.max(100, Math.round(amountRupees * 100)); // min ₹1

    const authHeader =
      'Basic ' +
      Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString(
        'base64'
      );

    const rzRes = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        description: 'Naturavya COD confirmation',
        reference_id: referenceId,
        customer: {
          name,
          contact: phone,
        },
        notify: {
          sms: true,
          email: false,
        },
        callback_method: 'get',
      }),
    });

    const rzJson = await rzRes.json();

    if (!rzRes.ok) {
      console.error('Razorpay error:', rzJson);
      return NextResponse.json(
        { success: false, error: 'Razorpay API error', details: rzJson },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_link_id: rzJson.id,
      short_url: rzJson.short_url,
      raw: rzJson,
    });
  } catch (err: any) {
    console.error('Razorpay COD error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}