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
  } catch (error) {
    console.error('Pages fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pages' }, { status: 500 });
  }
}

// PUT - Update page and images
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    if (!body.id && !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Page ID or slug is required' },
        { status: 400 }
      );
    }

    // Update page metadata
    const pageUpdate: Record<string, any> = {
      updated_by: user.id,
    };

    if (body.title !== undefined) pageUpdate.title = body.title;
    if (body.metaTitle !== undefined) pageUpdate.meta_title = body.metaTitle;
    if (body.metaDescription !== undefined) pageUpdate.meta_description = body.metaDescription;
    if (body.metaKeywords !== undefined) pageUpdate.meta_keywords = body.metaKeywords;
    if (body.ogImageUrl !== undefined) pageUpdate.og_image_url = body.ogImageUrl;
    if (body.content !== undefined) pageUpdate.content = body.content;
    if (body.status !== undefined) pageUpdate.status = body.status;

    let pageQuery = adminClient.from('pages').update(pageUpdate);
    
    if (body.id) {
      pageQuery = pageQuery.eq('id', body.id);
    } else {
      pageQuery = pageQuery.eq('slug', body.slug);
    }

    const { data: page, error: pageError } = await pageQuery.select('*').single();

    if (pageError) throw pageError;

    // Update images if provided
    if (body.images && Array.isArray(body.images)) {
      for (const image of body.images) {
        if (image.id) {
          // Update existing image
          await adminClient
            .from('page_images')
            .update({
              name: image.name,
              description: image.description,
              image_url: image.imageUrl,
              thumbnail_url: image.thumbnailUrl,
              section: image.section,
              position: image.position,
              display_order: image.displayOrder,
              is_active: image.isActive,
              mobile_image_url: image.mobileImageUrl,
              tablet_image_url: image.tabletImageUrl,
              alt_text: image.altText,
              title_text: image.titleText,
              link_url: image.linkUrl,
              link_target: image.linkTarget,
            })
            .eq('id', image.id);
        } else {
          // Create new image
          await adminClient
            .from('page_images')
            .insert({
              page_id: page.id,
              name: image.name,
              description: image.description,
              image_url: image.imageUrl,
              thumbnail_url: image.thumbnailUrl,
              section: image.section,
              position: image.position,
              display_order: image.displayOrder || 0,
              is_active: image.isActive !== false,
              mobile_image_url: image.mobileImageUrl,
              tablet_image_url: image.tabletImageUrl,
              alt_text: image.altText,
              title_text: image.titleText,
              link_url: image.linkUrl,
              link_target: image.linkTarget || '_self',
            });
        }
      }
    }

    // Fetch updated page with images
    const { data: updatedPage, error: fetchError } = await adminClient
      .from('pages')
      .select(`*, images:page_images(*)`)
      .eq('id', page.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error) {
    console.error('Page update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update page' }, { status: 500 });
  }
}