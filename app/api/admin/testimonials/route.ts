import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// =====================================================
// GET: Fetch all testimonials
// =====================================================
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data: testimonials, error } = await adminClient
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, testimonials: testimonials || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// =====================================================
// POST: Create or Update testimonial
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const body = await request.json();

    const displayName = body.name || body.client_name || 'Anonymous';
    const displayContent = body.content || body.client_review || body.review || '';
    const displayQuote = body.short_quote || body.quote || (displayContent.substring(0, 100) + '...');

    const payload: any = {
      name: displayName,
      client_name: displayName,
      content: displayContent,
      client_review: displayContent,
      quote: displayQuote,
      short_quote: displayQuote,
      rating: parseInt(body.rating || 5),
      role: body.role || body.customer_title || 'Verified Customer',
      customer_title: body.customer_title || body.role || null,
      customer_company: body.customer_company || null,
      customer_location: body.customer_location || null,
      customer_avatar_url: body.customer_avatar_url || null,
      is_active: body.is_active ?? true,
      is_featured: body.is_featured ?? false,
      status: body.status || 'published',
      created_by: user.id,
      updated_at: new Date().toISOString()
    };

    let query;
    if (body.id) {
      // Update existing
      query = adminClient.from('testimonials').update(payload).eq('id', body.id);
    } else {
      // Insert new
      query = adminClient.from('testimonials').insert(payload);
    }

    const { data, error } = await query.select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, testimonial: data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// =====================================================
// DELETE: Remove a testimonial
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Testimonial deleted' });
  } catch (error: any) {
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}