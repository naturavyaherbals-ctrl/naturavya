export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const status = searchParams.get('status');
    const productId = searchParams.get('productId');
    const featured = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('reviews')
      .select(`
        *,
        product:products(id, name, slug)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (productId) query = query.eq('product_id', productId);
    if (featured) query = query.eq('is_featured', true);

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      reviews: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST - Create review (manual)
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
    if (!body.customerName || !body.content || !body.rating) {
      return NextResponse.json(
        { success: false, error: 'Customer name, content, and rating are required' },
        { status: 400 }
      );
    }

    const { data: review, error } = await adminClient
      .from('reviews')
      .insert({
        product_id: body.productId || null,
        customer_name: body.customerName,
        customer_email: body.customerEmail || null,
        customer_phone: body.customerPhone || null,
        customer_avatar_url: body.customerAvatarUrl || null,
        customer_location: body.customerLocation || null,
        rating: body.rating,
        title: body.title || null,
        content: body.content,
        images: body.images || null,
        video_url: body.videoUrl || null,
        status: 'approved', // Manual reviews are auto-approved
        is_verified_purchase: body.isVerifiedPurchase || false,
        is_featured: body.isFeatured || false,
        source: 'manual',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        show_on_homepage: body.showOnHomepage || false,
        display_order: body.displayOrder || 0,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 });
  }
}