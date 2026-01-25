export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { orderService } from '@/lib/services/orderService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Determine if admin or customer request
    const isAdminRequest = searchParams.get('admin') === 'true';

    if (isAdminRequest) {
      const filters = {
        status: searchParams.get('status') as any || undefined,
        search: searchParams.get('search') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await orderService.getOrdersForAdmin(filters);
      return NextResponse.json({ success: true, ...result });
    }

    // Customer logic
    const orders = await orderService.getUserOrders(user.id);
    return NextResponse.json({ success: true, orders });
    
  } catch (error) {
    console.error('API Orders Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}