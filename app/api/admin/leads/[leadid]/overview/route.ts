export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ============================
   GET LEAD OVERVIEW
============================ */
export async function GET(
  req: NextRequest,
  { params }: { params: { leadid: string } }
) {
  try {
    const leadId = params.leadid;

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID missing' },
        { status: 400 }
      );
    }

    /* =========================
       1. FETCH LEAD
    ========================== */
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('Lead fetch error:', leadError);

      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    /* =========================
       2. FETCH TASKS
    ========================== */
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('related_lead_id', leadId)
      .or('status.is.null,status.eq.pending,status.eq.open')
      .order('created_at', { ascending: false });

    if (taskError) {
      console.error('Task fetch error:', taskError);
    }

    /* =========================
       3. FETCH ORDERS (Lead ID)
    ========================== */
    let orders: any[] = [];

    const { data: ordersByLead, error: orderLeadError } = await supabase
      .from('orders')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (orderLeadError) {
      console.error('Orders by lead error:', orderLeadError);
    }

    if (ordersByLead && ordersByLead.length > 0) {
      orders = ordersByLead;
    } else if (lead.phone) {
      /* =========================
         4. FALLBACK BY PHONE
      ========================== */

      const cleanPhone = lead.phone.replace(/\D/g, '');

      const { data: ordersByPhone, error: phoneError } = await supabase
        .from('orders')
        .select('*')
        .or(
          `phone.ilike.%${cleanPhone}%,customer_phone.ilike.%${cleanPhone}%,shipping_phone.ilike.%${cleanPhone}%`
        )
        .order('created_at', { ascending: false });

      if (phoneError) {
        console.error('Orders by phone error:', phoneError);
      }

      orders = ordersByPhone || [];
    }

    /* =========================
       5. USER ROLE (OPTIONAL)
    ========================== */

    let userRole: string | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.role) {
        userRole = user.role;
      }
    } catch {
      userRole = null;
    }

    /* =========================
       FINAL RESPONSE
    ========================== */
    return NextResponse.json({
      success: true,
      lead,
      tasks: tasks || [],
      orders,
      user_role: userRole,
    });

  } catch (err: any) {
    console.error('Lead overview API crash:', err);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: err?.message,
      },
      { status: 500 }
    );
  }
}
