import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { OrderStatus } from '@/types/order';

// GET /api/orders - Fetch orders with filters and role-based privacy
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the Team Member profile to determine Role and internal ID
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    // 3. Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as OrderStatus | null;
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isRTO = searchParams.get('isRTO');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 4. Build Base Query (Joining team_members to show "Handled By" info)
    let query = supabase
      .from('orders')
      .select('*, assigned_team_member:team_members(id, name)', { count: 'exact' });

    // 5. 🛡️ ROLE-BASED PRIVACY FILTER
    const role = member?.role?.toLowerCase().replace(' ', '_') || 'customer';
    
    if (role === 'agent') {
      // Agents can ONLY see orders specifically assigned to them
      if (member?.id) {
        query = query.eq('assigned_to', member.id);
      } else {
        // If they are an agent but have no team_member record, show nothing
        return NextResponse.json({ orders: [], pagination: { total: 0 } });
      }
    }
    // Note: super_admin and admin skip this block and see ALL orders

    // 6. Apply UI Filters
    if (status) {
      query = query.eq('current_status', status);
    }

    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
      );
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (isRTO === 'true') {
      query = query.eq('is_rto', true);
    }

    // 7. Apply sorting and pagination
    const offset = (page - 1) * limit;
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // 8. Success Response
    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}