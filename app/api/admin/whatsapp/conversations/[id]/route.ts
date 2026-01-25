import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { whatsappService } from '@/lib/services/whatsappService';

// GET - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient();

    // Get conversation
    const { data: conversation, error } = await adminClient
      .from('whatsapp_conversations')
      .select(`
        *,
        whatsapp_account:whatsapp_accounts(*),
        lead:leads(*),
        assigned_team_member:team_members(*, user:users(*))
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    // Get messages
    const messages = await whatsappService.getConversationMessages(params.id);

    // Mark as read
    await whatsappService.markConversationRead(params.id);

    return NextResponse.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Conversation fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// POST - Send message
export async function POST(
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

    // Get conversation
    const { data: conversation } = await adminClient
      .from('whatsapp_conversations')
      .select('*, whatsapp_account:whatsapp_accounts(*)')
      .eq('id', params.id)
      .single();

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    let result;

    if (body.type === 'template') {
      // Send template message
      result = await whatsappService.sendTemplateMessage(
        conversation.whatsapp_account_id,
        conversation.contact_phone,
        body.templateName,
        body.variables || [],
        conversation.lead_id,
        user.id
      );
    } else {
      // Send text message
      result = await whatsappService.sendTextMessage(
        conversation.whatsapp_account_id,
        conversation.contact_phone,
        body.message,
        params.id,
        user.id
      );
    }

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}

// PUT - Update conversation (assign, close, etc.)
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

    if (body.status !== undefined) updateData.status = body.status;
    if (body.assignedTo !== undefined) {
      updateData.assigned_to = body.assignedTo;
      updateData.assigned_at = new Date().toISOString();
    }
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await adminClient
      .from('whatsapp_conversations')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, conversation: data });
  } catch (error) {
    console.error('Conversation update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update conversation' }, { status: 500 });
  }
}