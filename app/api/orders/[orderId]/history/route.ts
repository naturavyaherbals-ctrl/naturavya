import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/orders/[orderId]/history - Get order status history
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { orderId } = params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch status history
    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (historyError) {
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    // Fetch delivery attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('delivery_attempts')
      .select('*')
      .eq('order_id', orderId)
      .order('attempt_number', { ascending: true });

    if (attemptsError) {
      return NextResponse.json(
        { error: 'Failed to fetch delivery attempts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      history,
      delivery_attempts: attempts,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}