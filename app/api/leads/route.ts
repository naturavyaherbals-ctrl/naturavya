// app/api/admin/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/leads
 * List leads with role-based restrictions + AI filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    // 1. Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Team member profile
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    // 3. Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // 4. Filters
    const status = searchParams.get('status');
    const temperature = searchParams.get('temperature');
    const search = searchParams.get('search');
    const overdue = searchParams.get('overdue') === 'true';
    const onlyActive = searchParams.get('onlyActive') !== 'false';

    // 5. Base query with assigned_team_member + nested user
    let query = supabase
      .from('leads')
      .select(
        `
          *,
          assigned_team_member:team_members(
            id,
            user:users(id, full_name, email)
          )
        `,
        { count: 'exact' },
      );

    // 6. Role-based restriction
    const normalizedRole = member?.role
      ?.toLowerCase()
      .replace(/\s+/g, '_'); // "Super Admin" -> "super_admin"

    if (normalizedRole === 'agent' && member?.id) {
      query = query.eq('assigned_to', member.id);
    }

    // 7. Default: hide closed leads unless explicitly requested
    if (onlyActive && !status) {
      query = query.not(
        'status',
        'in',
        '("order_confirmed","cancelled","not_interested","wrong_number")',
      );
    }

    // 8. Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 9. Temperature filter
    if (temperature && ['hot', 'warm', 'cold'].includes(temperature)) {
      query = query.eq('temperature', temperature);
    }

    // 10. Search by phone/full_name
    if (search) {
      const s = search.trim();
      query = query.or(
        `full_name.ilike.%${s}%,phone.ilike.%${s}%`,
      );
    }

    // 11. Overdue follow-ups
    if (overdue) {
      const nowIso = new Date().toISOString();
      query = query
        .lt('next_follow_up', nowIso)
        .not(
          'status',
          'in',
          '("order_confirmed","cancelled","not_interested","wrong_number")',
        );
    }

    // 12. Order: AI score desc, then newest first
    query = query
      .order('score', { ascending: false, nullsLast: true })
      .order('created_at', { ascending: false });

    // 13. Pagination
    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1,
    );

    if (error) {
      console.error('Leads query error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error('Critical crash in /api/admin/leads GET:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/leads
 * Create a new lead (manual) with AI scoring + follow-up scheduling
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Team member
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    const body = await request.json();

    const {
      full_name,
      phone,
      email,
      city,
      state,
      address,
      source = 'manual',
      status = 'new',
      priority = 5,
      notes = null,
      tags = null,
      interested_products = null,
      assigned_to,
    } = body;

    if (!full_name || !phone) {
      return NextResponse.json(
        { success: false, error: 'full_name and phone are required' },
        { status: 400 },
      );
    }

    // 3. Determine final assignee
    const normalizedRole = member?.role
      ?.toLowerCase()
      .replace(/\s+/g, '_');

    let finalAssignedTo = assigned_to || null;

    // Agents can only assign to themselves
    if (normalizedRole === 'agent' && member?.id) {
      finalAssignedTo = member.id;
    }

    // 4. Insert lead (DB trigger will set score + temperature)
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert({
        full_name,
        phone,
        email,
        city,
        state,
        address,
        source,
        status,
        priority,
        notes,
        tags,
        interested_products,
        assigned_to: finalAssignedTo,
      })
      .select('*')
      .single();

    if (insertError || !newLead) {
      console.error('Lead insert error:', insertError);
      return NextResponse.json(
        { success: false, error: insertError?.message || 'Insert failed' },
        { status: 400 },
      );
    }

    // 5. Trigger AI scorer edge function (to enrich ai_insights & suggestions)
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-lead-scorer`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lead_id: newLead.id }),
        },
      ).catch((err) =>
        console.error('Error calling ai-lead-scorer function:', err),
      );
    }

    // 6. Schedule follow-up sequences for this new manual lead
    try {
      const temperature =
        newLead.temperature ||
        (newLead.score >= 75
          ? 'hot'
          : newLead.score >= 45
          ? 'warm'
          : 'cold');

      const { data: sequences, error: seqError } = await supabase
        .from('follow_up_sequences')
        .select('*')
        .eq('trigger_event', 'new_lead')
        .or(`temperature.eq.${temperature},temperature.is.null`)
        .eq('is_active', true);

      if (seqError) {
        console.error('Error loading follow_up_sequences (POST):', seqError);
      } else if (sequences && sequences.length > 0) {
        const now = Date.now();
        const followUps = sequences.map((seq) => ({
          lead_id: newLead.id,
          sequence_id: seq.id,
          scheduled_at: new Date(
            now + (seq.delay_minutes || 0) * 60_000,
          ).toISOString(),
          channel: seq.channel || 'whatsapp',
          status: 'pending',
        }));

        await supabase.from('scheduled_follow_ups').insert(followUps);
      }
    } catch (err) {
      console.error('Error scheduling follow-ups (POST):', err);
    }

    return NextResponse.json(
      {
        success: true,
        data: newLead,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error('Critical crash in /api/admin/leads POST:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}