import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils/helpers';

// PUT - Update Category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify Admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (!userData || !['super_admin', 'admin'].includes(userData.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    const updateData: any = {};
    
    if (body.name) {
      updateData.name = body.name;
      // Optional: Only update slug if you really want to change URLs (can break SEO)
      // updateData.slug = slugify(body.name);
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    const { data: category, error } = await adminClient
      .from('categories')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - Delete Category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify Admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (!userData || !['super_admin', 'admin'].includes(userData.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('categories')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}