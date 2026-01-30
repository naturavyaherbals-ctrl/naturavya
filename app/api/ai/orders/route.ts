'use client'

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    /* -------- AI AUTH -------- */
    const aiKey = req.headers.get('x-ai-key');
    if (!aiKey || aiKey !== process.env.AI_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized AI access' },
        { status: 401 }
      );
    }

    /* -------- PARAM -------- */
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('order_id');

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'order_id required' },
        { status: 400 }
      );
    }

    /* -------- SUPABASE -------- */
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        current_status,
        is_rto,
        courier_name,
        awb_number,
        created_at,
        customer_name,
        customer_phone,
        total
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();
      console.log('AI ORDER QUERY:', orderNumber, data, error);

    if (error || !data) {maybe
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        order_number: data.order_number,
        status: data.current_status || data.status,
        is_rto: data.is_rto,
        courier: data.courier_name,
        awb: data.awb_number,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        total: data.total,
        created_at: data.created_at,
      },
    });
  } catch (err) {
    console.error('AI orders error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
