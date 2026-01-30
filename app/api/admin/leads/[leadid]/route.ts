import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET single lead with activities, status history, followups & orders
export async function GET(
  _request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const supaUser = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supaUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { leadId } = params;
    const supabase = createAdminClient();

    // 1) Base lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, assigned_team_member:team_members(id, name, email)')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      console.error('Lead fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const phone: string | null = lead.phone || null;
    const convertedOrderId: string | null = lead.converted_order_id || null;

    // 2) Other data in parallel (activities, status history, followups)
    const [{ data: activities }, { data: statusHistory }, { data: followups }] =
      await Promise.all([
        supabase
          .from('lead_activities_v')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('lead_status_history_v')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('scheduled_follow_ups')
          .select(
            'id, sequence_id, scheduled_at, executed_at, status, channel, attempts, last_error, created_at'
          )
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

    // 3) Orders by phone OR converted_order_id (robust, single .or())
    let ordersQuery = supabase
      .from('orders')
      .select(
        'id, order_number, created_at, status, current_status, total, total_amount, phone, shipping_phone, customer_phone, is_rto, awb_number, courier_name'
      )
      .order('created_at', { ascending: false })
      .limit(20);

    // Combine all match conditions in a single .or()
    const orConditions: string[] = [];
    if (convertedOrderId) orConditions.push(`id.eq.${convertedOrderId}`);
    if (phone) {
      orConditions.push(`phone.eq.${phone}`);
      orConditions.push(`shipping_phone.eq.${phone}`);
      orConditions.push(`customer_phone.eq.${phone}`);
    }
    if (orConditions.length > 0) {
      ordersQuery = ordersQuery.or(orConditions.join(','));
    }

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      console.error('Orders fetch error for lead:', ordersError);
    }

    const enrichedLead = {
      ...lead,
      activities: activities || [],
      status_history: statusHistory || [],
      followups: followups || [],
      orders: orders || [],
    };

    return NextResponse.json({ success: true, lead: enrichedLead });
  } catch (err) {
    console.error('GET /api/admin/leads/[leadId] error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT – used by useLeads.updateLeadStatus (status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const supaUser = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supaUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { leadId } = params;
    const body = await request.json();
    const supabase = createAdminClient();

    if (body.action === 'update_status') {
      const status = body.status as string | undefined;
      const notes = body.notes as string | undefined;

      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Missing status' },
          { status: 400 }
        );
      }

      const { data: updated, error } = await supabase
        .from('leads')
        .update({
          status,
          status_notes: notes ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select('id,status')
        .single();

      if (error || !updated) {
        console.error('Status update error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update status' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, lead: updated });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('PUT /api/admin/leads/[leadId] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH – edit lead / address
export async function PATCH(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const supaUser = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supaUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { leadId } = params;
    const body = await request.json();
    const supabase = createAdminClient();

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.full_name !== undefined) updatePayload.full_name = body.full_name;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.assigned_to !== undefined)
      updatePayload.assigned_to = body.assigned_to;
    if (body.address !== undefined) updatePayload.address = body.address;
    if (body.city !== undefined) updatePayload.city = body.city;
    if (body.state !== undefined) updatePayload.state = body.state;
    if (body.pincode !== undefined) updatePayload.pincode = body.pincode;
    if (body.notes !== undefined) updatePayload.notes = body.notes;
    if (body.priority !== undefined) {
      updatePayload.priority =
        typeof body.priority === 'number'
          ? body.priority
          : parseInt(String(body.priority || '0'), 10);
    }

    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId)
      .select('*, assigned_team_member:team_members(id, name, email)')
      .single();

    if (error || !updatedLead) {
      console.error('Lead update error:', error);
      return NextResponse.json(
        { success: false, error: 'Update failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('PATCH /api/admin/leads/[leadId] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}