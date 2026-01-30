export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch SEO settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const pageType = searchParams.get('pageType');
    const pageIdentifier = searchParams.get('pageIdentifier');

    let query = adminClient.from('seo_settings').select('*');

    if (pageType) {
      query = query.eq('page_type', pageType);
    }

    if (pageIdentifier) {
      query = query.eq('page_identifier', pageIdentifier);
    }

    const { data, error } = await query.order('page_type');

    if (error) throw error;

    return NextResponse.json({ success: true, seoSettings: data });
  } catch (error) {
    console.error('SEO settings fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch SEO settings' }, { status: 500 });
  }
}

// POST - Create or update SEO settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    if (!body.pageType) {
      return NextResponse.json(
        { success: false, error: 'Page type is required' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const { data: existing } = await adminClient
      .from('seo_settings')
      .select('id')
      .eq('page_type', body.pageType)
      .eq('page_identifier', body.pageIdentifier || '')
      .single();

    const seoData = {
      page_type: body.pageType,
      page_identifier: body.pageIdentifier || null,
      meta_title: body.metaTitle || null,
      meta_description: body.metaDescription || null,
      meta_keywords: body.metaKeywords || null,
      og_title: body.ogTitle || null,
      og_description: body.ogDescription || null,
      og_image_url: body.ogImageUrl || null,
      og_type: body.ogType || 'website',
      twitter_title: body.twitterTitle || null,
      twitter_description: body.twitterDescription || null,
      twitter_image_url: body.twitterImageUrl || null,
      twitter_card: body.twitterCard || 'summary_large_image',
      canonical_url: body.canonicalUrl || null,
      robots: body.robots || 'index, follow',
      structured_data: body.structuredData || null,
      custom_head_tags: body.customHeadTags || null,
      custom_scripts: body.customScripts || null,
    };

    let data, error;

    if (existing) {
      const result = await adminClient
        .from('seo_settings')
        .update(seoData)
        .eq('id', existing.id)
        .select('*')
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await adminClient
        .from('seo_settings')
        .insert(seoData)
        .select('*')
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, seoSettings: data });
  } catch (error) {
    console.error('SEO settings save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save SEO settings' }, { status: 500 });
  }
}