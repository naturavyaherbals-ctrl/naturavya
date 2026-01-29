import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role and team member id
    const { data: appUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single();

    let teamMemberId: string | null = null;
    let roleNorm: string = appUser?.role?.toLowerCase().replace(/\s+/g, '_') || '';

    if (roleNorm === 'agent' || roleNorm === 'manager') {
      const { data: member } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      teamMemberId = member?.id || null;
    }

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isRTOParam = searchParams.get('isRTO');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder =
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Base query
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // AGENT: Only show their own orders
    if ((roleNorm === 'agent' || roleNorm === 'manager') && teamMemberId) {
      query = query.eq('created_by_agent', teamMemberId);
    }

    // Status (match either current_status or status)
    if (status && status !== '') {
      query = query.or(
        `current_status.eq.${status},status.eq.${status}`
      );
    }

    // isRTO filter
    if (isRTOParam !== null && isRTOParam !== '') {
      const isRTO = isRTOParam === 'true';
      query = query.eq('is_rto', isRTO);
    }

    // Date range
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lt(
        'created_at',
        new Date(endDate + 'T23:59:59.999Z').toISOString()
      );
    }

    // Search on order_number, customer_name, phone
    if (search && search.trim() !== '') {
      const s = search.trim();
      query = query.or(
        `order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,phone.ilike.%${s}%`
      );
    }

    // Sorting
    const allowedSort = new Set([
      'created_at',
      'order_number',
      'total',
      'current_status',
    ]);
    const sortColumn = allowedSort.has(sortBy!) ? sortBy! : 'created_at';

    query = query.order(sortColumn, {
      ascending: sortOrder === 'asc',
    });

    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error('Orders query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error('Critical /api/orders error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}