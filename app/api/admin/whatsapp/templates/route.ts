import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const accountId = searchParams.get('accountId');

    let query = adminClient
      .from('whatsapp_templates')
      .select('*')
      .eq('is_active', true);

    if (accountId) {
      query = query.eq('whatsapp_account_id', accountId);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, templates: data });
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST - Create template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    if (!body.name || !body.bodyText) {
      return NextResponse.json(
        { success: false, error: 'Name and body text are required' },
        { status: 400 }
      );
    }

    const { data, error } = await adminClient
      .from('whatsapp_templates')
      .insert({
        whatsapp_account_id: body.accountId || null,
        name: body.name,
        template_id: body.templateId || null,
        language: body.language || 'en',
        category: body.category || 'UTILITY',
        header_type: body.headerType || null,
        header_content: body.headerContent || null,
        body_text: body.bodyText,
        footer_text: body.footerText || null,
        variables: body.variables || null,
        buttons: body.buttons || null,
        status: 'pending', // Needs Meta approval
        is_active: true,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, template: data });
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create template' }, { status: 500 });
  }
}