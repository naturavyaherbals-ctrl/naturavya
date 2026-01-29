// app/api/admin/leads/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function csvEscape(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const source = searchParams.get('source');
    const temperature = searchParams.get('temperature');
    const assignedTo =
      searchParams.get('assigned_to') || searchParams.get('assignedTo');

    // Base query – select only needed columns
    let query = supabase
      .from('leads')
      .select(
        `
        id,
        created_at,
        full_name,
        phone,
        email,
        status,
        source,
        campaign_name,
        source_campaign,
        ad_id,
        adset_id,
        form_id,
        form_name,
        city,
        state,
        pincode,
        temperature,
        score,
        is_converted,
        converted_at,
        converted_order_id,
        priority,
        assigned_to,
        next_follow_up_at
      `
      )
      .order('created_at', { ascending: false })
      .limit(5000); // safety

    if (status && status !== '') {
      query = query.eq('status', status);
    }
    if (assignedTo && assignedTo !== 'undefined' && assignedTo !== 'null') {
      query = query.eq('assigned_to', assignedTo);
    }
    if (source && source !== '') {
      query = query.eq('source', source);
    }
    if (temperature && temperature !== '') {
      query = query.eq('temperature', temperature);
    }
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Leads export query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    const rows = data || [];

    const headers = [
      'id',
      'created_at',
      'full_name',
      'phone',
      'email',
      'status',
      'source',
      'campaign_name',
      'source_campaign',
      'ad_id',
      'adset_id',
      'form_id',
      'form_name',
      'city',
      'state',
      'pincode',
      'temperature',
      'score',
      'is_converted',
      'converted_at',
      'converted_order_id',
      'priority',
      'assigned_to',
      'next_follow_up_at',
    ];

    const lines: string[] = [];
    lines.push(headers.map(csvEscape).join(','));

    for (const row of rows) {
      const vals = headers.map((h) => {
        // @ts-ignore
        const v = row[h];
        return csvEscape(v);
      });
      lines.push(vals.join(','));
    }

    const csv = lines.join('\n');

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `naturavya_leads_${todayStr}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('Leads export crash:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}