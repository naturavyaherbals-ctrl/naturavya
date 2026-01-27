import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/orders/[orderId] - Get single order with history
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ orderId: string }> } // 👈 UPDATED TYPE
) {
  try {
    const params = await props.params; // 👈 AWAIT PARAMS (Crucial Fix)
    const { orderId } = params;

    const supabase = await createServerSupabaseClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the database function to get order with full history
    const { data, error } = await supabase.rpc('get_order_with_history', {
      p_order_id: orderId,
    });

    if (error) {
      console.error('Error fetching order (RPC):', error);
      
      // FALLBACK: If RPC fails/missing, fetch manually to prevent 500 error
      if (error.code === '42883' || error.code === 'PGRST202') { 
        console.log('Falling back to manual fetch...');
        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
        const { data: history } = await supabase.from('order_status_history').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
        
        if (order) {
          return NextResponse.json({
            order,
            status_history: history || [],
            delivery_attempts: [],
            rto_details: null
          });
        }
      }

      return NextResponse.json(
        { error: error.message || 'Failed to fetch order' },
        { status: 500 }
      );
    }

    if (!data || data.error) {
      return NextResponse.json(
        { error: data?.error || 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}