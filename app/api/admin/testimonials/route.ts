import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const status = searchParams.get('status');
    const featured = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('testimonials')
      .select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (featured) query = query.eq('is_featured', true);

    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      testimonials: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Testimonials fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST - Create testimonial
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify super_admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Only super admins can create testimonials' }, { status: 403 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    if (!body.customerName || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Customer name and content are required' },
        { status: 400 }
      );
    }

    const { data: testimonial, error } = await adminClient
      .from('testimonials')
      .insert({
        customer_name: body.customerName,
        customer_title: body.customerTitle || null,
        customer_company: body.customerCompany || null,
        customer_location: body.customerLocation || null,
        customer_avatar_url: body.customerAvatarUrl || null,
        content: body.content,
        short_quote: body.shortQuote || null,
        rating: body.rating || null,
        image_url: body.imageUrl || null,
        video_url: body.videoUrl || null,
        video_thumbnail_url: body.videoThumbnailUrl || null,
        category: body.category || null,
        tags: body.tags || null,
        status: body.status || 'published',
        is_featured: body.isFeatured || false,
        show_on_homepage: body.showOnHomepage || false,
        display_order: body.displayOrder || 0,
        display_pages: body.displayPages || null,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error('Testimonial creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create testimonial' }, { status: 500 });
  }
}