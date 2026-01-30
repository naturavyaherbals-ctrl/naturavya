export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Get single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('testimonials')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, testimonial: data });
  } catch (error) {
    console.error('Testimonial fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch testimonial' }, { status: 500 });
  }
}

// PUT - Update testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    const updateData: Record<string, any> = {};

    if (body.customerName !== undefined) updateData.customer_name = body.customerName;
    if (body.customerTitle !== undefined) updateData.customer_title = body.customerTitle;
    if (body.customerCompany !== undefined) updateData.customer_company = body.customerCompany;
    if (body.customerLocation !== undefined) updateData.customer_location = body.customerLocation;
    if (body.customerAvatarUrl !== undefined) updateData.customer_avatar_url = body.customerAvatarUrl;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.shortQuote !== undefined) updateData.short_quote = body.shortQuote;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.videoUrl !== undefined) updateData.video_url = body.videoUrl;
    if (body.videoThumbnailUrl !== undefined) updateData.video_thumbnail_url = body.videoThumbnailUrl;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isFeatured !== undefined) updateData.is_featured = body.isFeatured;
    if (body.showOnHomepage !== undefined) updateData.show_on_homepage = body.showOnHomepage;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;
    if (body.displayPages !== undefined) updateData.display_pages = body.displayPages;

    const { data, error } = await adminClient
      .from('testimonials')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, testimonial: data });
  } catch (error) {
    console.error('Testimonial update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('testimonials')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Testimonial delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete testimonial' }, { status: 500 });
  }
}