export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Get single review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('reviews')
      .select(`*, product:products(id, name, slug)`)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch review' }, { status: 500 });
  }
}

// PUT - Update review
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

    // Status change
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'approved') {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }
    }

    // Other fields
    if (body.isFeatured !== undefined) updateData.is_featured = body.isFeatured;
    if (body.showOnHomepage !== undefined) updateData.show_on_homepage = body.showOnHomepage;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;
    if (body.adminNotes !== undefined) updateData.admin_notes = body.adminNotes;
    if (body.customerName) updateData.customer_name = body.customerName;
    if (body.content) updateData.content = body.content;
    if (body.rating) updateData.rating = body.rating;
    if (body.title !== undefined) updateData.title = body.title;

    const { data, error } = await adminClient
      .from('reviews')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE - Delete review
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
      .from('reviews')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}