// app/api/admin/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const assignedTo =
      searchParams.get('assigned_to') || searchParams.get('assignedTo');
    const temperature = searchParams.get('temperature');
    const minScoreParam = searchParams.get('min_score');
    const maxScoreParam = searchParams.get('max_score');
    const sort = searchParams.get('sort') || 'created_desc';

    const minScore =
      minScoreParam !== null && minScoreParam !== ''
        ? Number(minScoreParam)
        : undefined;
    const maxScore =
      maxScoreParam !== null && maxScoreParam !== ''
        ? Number(maxScoreParam)
        : undefined;

    // 1. Base Query
    let query = supabase
      .from('leads')
      .select(
        `
        *,
        assigned_team_member:team_members(id, name, email)
      `,
        { count: 'exact' }
      );

    // 2. Apply Filters
    if (status && status !== '') {
      query = query.eq('status', status);
    }

    if (assignedTo && assignedTo !== 'undefined' && assignedTo !== 'null') {
      query = query.eq('assigned_to', assignedTo);
    }

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (temperature && temperature !== '') {
      query = query.eq('temperature', temperature);
    }

    if (minScore !== undefined && !Number.isNaN(minScore)) {
      query = query.gte('score', minScore);
    }

    if (maxScore !== undefined && !Number.isNaN(maxScore)) {
      query = query.lte('score', maxScore);
    }

    // 3. Sorting
    switch (sort) {
      case 'score_desc':
        query = query.order('score', { ascending: false });
        break;
      case 'score_asc':
        query = query.order('score', { ascending: true });
        break;
      case 'priority_desc':
        query = query
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });
        break;
      case 'priority_asc':
        query = query
          .order('priority', { ascending: true })
          .order('created_at', { ascending: false });
        break;
      case 'created_asc':
        query = query.order('created_at', { ascending: true });
        break;
      case 'created_desc':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // 4. Execution
    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error('Leads Query Error:', error);

      // FALLBACK: leads only (no join)
      let fallbackQuery = supabase
        .from('leads')
        .select('*', { count: 'exact' });

      if (status && status !== '') {
        fallbackQuery = fallbackQuery.eq('status', status);
      }

      if (assignedTo && assignedTo !== 'undefined' && assignedTo !== 'null') {
        fallbackQuery = fallbackQuery.eq('assigned_to', assignedTo);
      }

      if (search) {
        fallbackQuery = fallbackQuery.or(
          `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      if (temperature && temperature !== '') {
        fallbackQuery = fallbackQuery.eq('temperature', temperature);
      }

      if (minScore !== undefined && !Number.isNaN(minScore)) {
        fallbackQuery = fallbackQuery.gte('score', minScore);
      }

      if (maxScore !== undefined && !Number.isNaN(maxScore)) {
        fallbackQuery = fallbackQuery.lte('score', maxScore);
      }

      switch (sort) {
        case 'score_desc':
          fallbackQuery = fallbackQuery.order('score', { ascending: false });
          break;
        case 'score_asc':
          fallbackQuery = fallbackQuery.order('score', { ascending: true });
          break;
        case 'priority_desc':
          fallbackQuery = fallbackQuery
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });
          break;
        case 'priority_asc':
          fallbackQuery = fallbackQuery
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });
          break;
        case 'created_asc':
          fallbackQuery = fallbackQuery.order('created_at', {
            ascending: true,
          });
          break;
        case 'created_desc':
        default:
          fallbackQuery = fallbackQuery.order('created_at', {
            ascending: false,
          });
          break;
      }

      const fallback = await fallbackQuery.range(
        offset,
        offset + limit - 1
      );

      return NextResponse.json({
        success: true,
        data: fallback.data || [],
        pagination: {
          total: fallback.count || 0,
          total_pages: Math.ceil((fallback.count || 0) / limit),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Critical Leads API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST – create lead from admin + trigger AI scorer edge function
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const full_name =
      (body.full_name as string | undefined) ||
      (body.name as string | undefined) ||
      'Unknown';
    const phone = (body.phone as string | undefined) || '';
    const email = (body.email as string | undefined) || null;
    const city = (body.city as string | undefined) || null;
    const state = (body.state as string | undefined) || null;
    const address = (body.address as string | undefined) || null;
    const source =
      (body.source as string | undefined) || 'manual_crm';

    const notes = (body.notes as string | undefined) || null;
    const priorityRaw = body.priority;
    const priority =
      typeof priorityRaw === 'number'
        ? priorityRaw
        : priorityRaw
        ? parseInt(String(priorityRaw), 10)
        : 0;

    const assigned_to =
      (body.assigned_to as string | undefined) || null;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone is required' },
        { status: 400 }
      );
    }

    const insertPayload: any = {
      full_name,
      phone,
      email,
      city,
      state,
      address,
      source,
      notes,
      priority,
      status: 'new',
    };

    if (assigned_to) {
      insertPayload.assigned_to = assigned_to;
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert(insertPayload)
      .select(
        'id, full_name, phone, email, city, state, source, score, temperature'
      )
      .single();

    if (error || !newLead) {
      console.error('Lead create error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Fire-and-forget: call ai-lead-scorer edge function
    try {
      const edgeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (edgeUrl && serviceKey) {
        fetch(`${edgeUrl}/functions/v1/ai-lead-scorer`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lead_id: newLead.id }),
        }).catch((err) =>
          console.error('ai-lead-scorer call failed:', err)
        );
      } else {
        console.warn(
          'ai-lead-scorer not called: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing'
        );
      }
    } catch (err) {
      console.error('Error calling ai-lead-scorer:', err);
    }

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error('POST /api/admin/leads error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}