export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch quick replies
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get team member ID for the current user
    const { data: teamMember } = await adminClient
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Get quick replies (global + user's own)
    const { data, error } = await adminClient
      .from('whatsapp_quick_replies')
      .select('*')
      .or(`team_member_id.is.null${teamMember ? `,team_member_id.eq.${teamMember.id}` : ''}`)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, quickReplies: data });
  } catch (error) {
    console.error('Quick replies fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quick replies' }, { status: 500 });
  }
}

// POST - Create quick reply
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    if (!body.title || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Get team member ID
    const { data: teamMember } = await adminClient
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data, error } = await adminClient
      .from('whatsapp_quick_replies')
      .insert({
        team_member_id: body.isGlobal ? null : teamMember?.id,
        title: body.title,
        shortcut: body.shortcut || null,
        message: body.message,
        include_media: body.includeMedia || false,
        media_url: body.mediaUrl || null,
        media_type: body.mediaType || null,
        category: body.category || null,
        tags: body.tags || null,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, quickReply: data });
  } catch (error) {
    console.error('Quick reply creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create quick reply' }, { status: 500 });
  }
}

// PUT - Update quick reply usage
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const adminClient = createAdminClient();

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Increment usage count
    const { data, error } = await adminClient
      .from('whatsapp_quick_replies')
      .update({ usage_count: adminClient.rpc('increment_usage_count') })
      .eq('id', body.id)
      .select('*')
      .single();

    if (error) {
      // Fallback: manual increment
      const { data: current } = await adminClient
        .from('whatsapp_quick_replies')
        .select('usage_count')
        .eq('id', body.id)
        .single();

      if (current) {
        await adminClient
          .from('whatsapp_quick_replies')
          .update({ usage_count: (current.usage_count || 0) + 1 })
          .eq('id', body.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quick reply update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update quick reply' }, { status: 500 });
  }
}