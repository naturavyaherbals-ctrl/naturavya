import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch pages with images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();
    const slug = searchParams.get('slug');

    let query = adminClient
      .from('pages')
      .select(`
        *,
        images:page_images(*)
      `);

    if (slug) {
      query = query.eq('slug', slug).single();
    } else {
      query = query.order('title');
    }

    const { data, error } = await query;
    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({
      success: true,
      [slug ? 'page' : 'pages']: data,
    });
  } catch (error: any) {
    console.error('Pages fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update page metadata or manage images
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();
    const { id, slug, images, action, image_id, image_data } = body;

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'Page ID or slug is required' }, { status: 400 });
    }

    // --- 1. HANDLE IMAGE DELETION ---
    if (action === 'delete' && image_id) {
      const { error: delError } = await adminClient
        .from('page_images')
        .delete()
        .eq('id', image_id);
      if (delError) throw delError;
    }

    // --- 2. UPDATE PAGE METADATA ---
    // We only update page table if metadata fields are actually sent
    const metadataFields = ['title', 'meta_title', 'meta_description', 'status', 'content'];
    const hasMetadataUpdate = metadataFields.some(key => body[key] !== undefined);

    let pageId = id;

    if (hasMetadataUpdate) {
      const pageUpdate: Record<string, any> = {};
      if (body.title) pageUpdate.title = body.title;
      if (body.meta_title || body.metaTitle) pageUpdate.meta_title = body.meta_title || body.metaTitle;
      if (body.meta_description || body.metaDescription) pageUpdate.meta_description = body.meta_description || body.metaDescription;
      if (body.status) pageUpdate.status = body.status;

      const { data: page, error: pageError } = await adminClient
        .from('pages')
        .update(pageUpdate)
        .eq(id ? 'id' : 'slug', id || slug)
        .select()
        .single();

      if (pageError) throw pageError;
      pageId = page.id;
    }

    // --- 3. HANDLE IMAGES (UPSERT LOGIC) ---
    // If frontend sends "image_data" (single add/edit)
    if (image_data) {
      const { error: imgError } = await adminClient
        .from('page_images')
        .upsert({
          ...image_data,
          page_id: pageId,
          updated_at: new Date().toISOString()
        });
      if (imgError) throw imgError;
    }

    // If frontend sends "images" array (bulk update/reorder)
    if (images && Array.isArray(images)) {
      for (const img of images) {
        const imgPayload = {
          page_id: pageId,
          name: img.name,
          image_url: img.image_url || img.imageUrl,
          mobile_image_url: img.mobile_image_url || img.mobileImageUrl,
          section: img.section,
          position: img.position,
          alt_text: img.alt_text || img.altText,
          link_url: img.link_url || img.linkUrl,
          display_order: img.display_order || img.displayOrder || 0,
          is_active: img.is_active ?? img.isActive ?? true,
        };

        if (img.id) {
          await adminClient.from('page_images').update(imgPayload).eq('id', img.id);
        } else {
          await adminClient.from('page_images').insert(imgPayload);
        }
      }
    }

    // --- 4. FETCH UPDATED STATE ---
    const { data: updatedPage, error: fetchError } = await adminClient
      .from('pages')
      .select(`*, images:page_images(*)`)
      .eq('id', pageId)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({ success: true, page: updatedPage });

  } catch (error: any) {
    console.error('Page operation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}