import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateRtoRisk } from '@/lib/ai/rto-engine';

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const { order_id } = await req.json();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      payment_method,
      address,
      city,
      pincode,
      phone,
      lead:leads(score)
    `)
    .eq('id', order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // 🔍 Signals
  const isCod = order.payment_method === 'cod';
  const addressComplete =
    !!order.address && !!order.city && !!order.pincode;

  // Example pincode risk logic
  const highRtoPincodes = ['110094', '400097', '700023'];
  const pincodeRisk = highRtoPincodes.includes(order.pincode);

  const leadScore = order.lead?.score ?? 50;

  // Check repeat customer
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('phone', order.phone)
    .neq('id', order.id);

  const isRepeatCustomer = (count || 0) > 0;

  // WhatsApp reply signal (simplified)
  const whatsappReplied = false;

  const { score, risk } = calculateRtoRisk({
    isCod,
    addressComplete,
    pincodeRisk,
    leadScore,
    isRepeatCustomer,
    whatsappReplied,
  });

  const autoActions: any = {};

  if (risk === 'high') {
    autoActions.whatsapp_address_confirm = true;
    autoActions.cod_confirmation = isCod;
    autoActions.agent_call_required = true;
  }

  if (risk === 'medium') {
    autoActions.whatsapp_address_confirm = true;
  }

  await supabase
    .from('orders')
    .update({
      rto_risk: risk,
      rto_score: score,
      auto_actions: autoActions,
    })
    .eq('id', order.id);

  return NextResponse.json({
    success: true,
    rto_risk: risk,
    rto_score: score,
    auto_actions: autoActions,
  });
}
