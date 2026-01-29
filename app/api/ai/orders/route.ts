export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    /* ---------------- AI AUTH ---------------- */
    const aiKey = req.headers.get('x-ai-key');

    if (!aiKey || aiKey !== process.env.AI_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized AI access' },
        { status: 401 }
      );
    }

    /* ---------------- PARAMS ---------------- */
    const { searchParams } = new URL(req.url);
    const orderId =
      searchParams.get('order_id') ||
      searchParams.get('order_number');

    if (!orderId) {
      return NextResponse.json(
        { error: 'order_id or order_number required' },
        { status: 400 }
      );
    }

    /* ---------------- SUPABASE ADMIN ---------------- */
    const supabase = createAdminClient();

    /* ---------------- QUERY ---------------- */
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        current_status,
        is_rto,
        courier,
        awb,
        created_at,
        customer_name,
        customer_phone,
        total
      `)
      .or(
        `id.eq.${orderId},order_number.eq.${orderId}`
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      success: true,
      order: {
        id: data.id,
        order_number: data.order_number,
        status: data.current_status || data.status,
        is_rto: data.is_rto,
        courier: data.courier,
        awb: data.awb,
        created_at: data.created_at,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        total: data.total,
      },
    });
  } catch (err: any) {
    console.error('AI /api/ai/orders error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
