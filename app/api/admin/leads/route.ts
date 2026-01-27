import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const assignedTo = searchParams.get('assigned_to') || searchParams.get('assignedTo');

    // 1. Base Query - Fetching from leads and joining team_members (NO users join)
    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(id, name, email)
      `, { count: 'exact' });

    // 2. Apply Filters
    if (status && status !== '') {
      query = query.eq('status', status);
    }

    if (assignedTo && assignedTo !== 'undefined' && assignedTo !== 'null') {
      query = query.eq('assigned_to', assignedTo);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // 3. Execution
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Leads Query Error:', error);
      
      // FALLBACK: If the join above fails, fetch leads ONLY (no names) so the page doesn't crash
      const fallback = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      return NextResponse.json({
        success: true,
        data: fallback.data || [],
        pagination: {
          total: fallback.count || 0,
          total_pages: Math.ceil((fallback.count || 0) / limit),
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      }
    });

  } catch (error: any) {
    console.error('Critical Leads API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}