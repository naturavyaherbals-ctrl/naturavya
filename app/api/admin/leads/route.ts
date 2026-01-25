import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizePhone } from '@/lib/utils/validators';

// GET - Fetch leads for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(*, user:users(*))
      `, { count: 'exact' });

    // Apply filters
    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);

    const source = searchParams.get('source');
    if (source) query = query.eq('source', source);

    const assignedTo = searchParams.get('assignedTo');
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      leads: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST - Create new lead (manual entry)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    // Validate required fields
    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Check for duplicate phone
    const phone = sanitizePhone(body.phone);
    const { data: existingLead } = await adminClient
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead with this phone number already exists', existingId: existingLead.id },
        { status: 400 }
      );
    }

    // Create lead
    const { data: lead, error } = await adminClient
      .from('leads')
      .insert({
        full_name: body.fullName,
        phone: phone,
        email: body.email || null,
        alternate_phone: body.alternatePhone || null,
        city: body.city || null,
        state: body.state || null,
        pincode: body.pincode || null,
        address: body.address || null,
        source: body.source || 'manual',
        source_campaign: body.sourceCampaign || null,
        interested_products: body.interestedProducts || null,
        interested_categories: body.interestedCategories || null,
        budget_range: body.budgetRange || null,
        assigned_to: body.assignedTo || null,
        assigned_at: body.assignedTo ? new Date().toISOString() : null,
        status: body.status || 'new',
        priority: body.priority || 5,
        tags: body.tags || null,
        notes: body.notes || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Log activity
    await adminClient.from('lead_activities').insert({
      lead_id: lead.id,
      activity_type: 'note',
      title: 'Lead created manually',
      description: `Created by admin`,
      created_by: user.id,
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}