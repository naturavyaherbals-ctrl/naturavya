import { NextRequest, NextResponse } from 'next/server';
import { shiprocket } from '@/lib/services/shiprocket-full';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Only allow admin/super_admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (!['admin', 'super_admin'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    let result;

    switch (action) {
      case 'check_serviceability':
        result = await shiprocket.checkServiceability(data.pickup, data.delivery, data.weight, data.cod);
        break;
      case 'create_order':
        result = await shiprocket.createOrder(data.order);
        break;
      case 'assign_awb':
        result = await shiprocket.assignAWB(data.shipment_id, data.courier_id);
        break;
      case 'request_pickup':
        result = await shiprocket.requestPickup(data.shipment_id);
        break;
      case 'generate_manifest':
        result = await shiprocket.generateManifest(data.shipment_id);
        break;
      case 'print_manifest':
        result = await shiprocket.printManifest(data.order_ids);
        break;
      case 'generate_label':
        result = await shiprocket.generateLabel(data.shipment_id);
        break;
      case 'print_invoice':
        result = await shiprocket.printInvoice(data.order_ids);
        break;
      case 'track':
        result = await shiprocket.trackAWB(data.awb);
        break;
      case 'get_orders':
        result = await shiprocket.getOrders(data.page);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Shiprocket API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}