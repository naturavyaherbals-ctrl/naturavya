// =====================================================
// LEADS API - CRM LEAD MANAGEMENT
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// =====================================================
// GET - LIST LEADS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const assignedTo = searchParams.get('assigned_to');
    const search = searchParams.get('search');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const priority = searchParams.get('priority');
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(*, user:users(full_name, avatar_url)),
        activities:lead_activities(*, created_by_user:users(full_name)),
        status_history:lead_status_history(*, created_by_user:users(full_name))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', assignedTo);
      }
    }

    if (priority) {
      query = query.eq('priority', parseInt(priority));
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - CREATE LEAD
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminClient = createAdminClient();

    const {
      full_name,
      phone,
      email,
      alternate_phone,
      city,
      state,
      postal_code,
      source,
      campaign_name,
      interested_products,
      notes,
      priority,
    } = body;

    // Check for duplicate
    const { data: existingLead } = await adminClient
      .from('leads')
      .select('id, status')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingLead && existingLead.status !== 'converted') {
      return NextResponse.json({
        success: false,
        error: 'Lead with this phone number already exists',
        duplicate: true,
        existing_lead_id: existingLead.id,
      }, { status: 400 });
    }

    // Create lead (auto-assignment handled by database trigger)
    const { data: lead, error: leadError } = await adminClient
      .from('leads')
      .insert({
        full_name,
        phone,
        email,
        alternate_phone,
        city,
        state,
        postal_code,
        source: source || 'website',
        campaign_name,
        interested_products: interested_products || [],
        notes,
        priority: priority || 0,
      })
      .select(`
        *,
        assigned_team_member:team_members(*, user:users(full_name))
      `)
      .single();

    if (leadError) throw leadError;

    // Create initial status history
    await adminClient
      .from('lead_status_history')
      .insert({
        lead_id: lead.id,
        new_status: 'new',
        notes: 'Lead created',
      });

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead created successfully',
    });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}