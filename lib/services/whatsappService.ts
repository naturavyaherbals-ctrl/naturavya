import { createAdminClient } from '@/lib/supabase/admin';

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'interactive';
  content?: string;
  templateName?: string;
  templateVariables?: string[];
  mediaUrl?: string;
  interactive?: any;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  // Send a text message
  async sendTextMessage(
    accountId: string,
    to: string,
    text: string,
    conversationId?: string,
    userId?: string
  ): Promise<SendMessageResult> {
    const adminClient = createAdminClient();

    try {
      // Get WhatsApp account details
      const { data: account } = await adminClient
        .from('whatsapp_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account || !account.access_token || !account.phone_number_id) {
        return { success: false, error: 'WhatsApp account not configured' };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(to);

      // Send via Meta API
      const response = await fetch(
        `${this.baseUrl}/${account.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: { body: text },
          }),
        }
      );

      const result = await response.json();

      if (result.messages?.[0]?.id) {
        // Get or create conversation
        let convId = conversationId;
        if (!convId) {
          const { data: conv } = await adminClient
            .from('whatsapp_conversations')
            .upsert({
              whatsapp_account_id: accountId,
              contact_phone: formattedPhone,
              status: 'open',
            }, {
              onConflict: 'whatsapp_account_id,contact_phone',
            })
            .select('id')
            .single();
          convId = conv?.id;
        }

        // Save message to database
        if (convId) {
          await adminClient.from('whatsapp_messages').insert({
            conversation_id: convId,
            whatsapp_account_id: accountId,
            wa_message_id: result.messages[0].id,
            direction: 'outbound',
            message_type: 'text',
            content: text,
            status: 'sent',
            sent_at: new Date().toISOString(),
            created_by: userId,
          });
        }

        // Update account stats
        await adminClient
          .from('whatsapp_accounts')
          .update({
            messages_sent: account.messages_sent + 1,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', accountId);

        return { success: true, messageId: result.messages[0].id };
      }

      return { success: false, error: result.error?.message || 'Failed to send message' };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Send a template message
  async sendTemplateMessage(
    accountId: string,
    to: string,
    templateName: string,
    variables: string[],
    leadId?: string,
    userId?: string
  ): Promise<SendMessageResult> {
    const adminClient = createAdminClient();

    try {
      const { data: account } = await adminClient
        .from('whatsapp_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account || !account.access_token || !account.phone_number_id) {
        return { success: false, error: 'WhatsApp account not configured' };
      }

      // Get template
      const { data: template } = await adminClient
        .from('whatsapp_templates')
        .select('*')
        .eq('name', templateName)
        .eq('whatsapp_account_id', accountId)
        .single();

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const formattedPhone = this.formatPhoneNumber(to);

      // Build template components
      const components: any[] = [];
      if (variables.length > 0) {
        components.push({
          type: 'body',
          parameters: variables.map(v => ({ type: 'text', text: v })),
        });
      }

      // Send via Meta API
      const response = await fetch(
        `${this.baseUrl}/${account.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'template',
            template: {
              name: template.template_id || templateName,
              language: { code: template.language || 'en' },
              components,
            },
          }),
        }
      );

      const result = await response.json();

      if (result.messages?.[0]?.id) {
        // Get or create conversation
        const { data: conv } = await adminClient
          .from('whatsapp_conversations')
          .upsert({
            whatsapp_account_id: accountId,
            contact_phone: formattedPhone,
            lead_id: leadId,
            status: 'open',
          }, {
            onConflict: 'whatsapp_account_id,contact_phone',
          })
          .select('id')
          .single();

        if (conv) {
          await adminClient.from('whatsapp_messages').insert({
            conversation_id: conv.id,
            whatsapp_account_id: accountId,
            wa_message_id: result.messages[0].id,
            direction: 'outbound',
            message_type: 'template',
            content: template.body_text,
            template_id: template.id,
            template_variables: variables,
            status: 'sent',
            sent_at: new Date().toISOString(),
            created_by: userId,
          });
        }

        // Update template usage
        await adminClient
          .from('whatsapp_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', template.id);

        return { success: true, messageId: result.messages[0].id };
      }

      return { success: false, error: result.error?.message || 'Failed to send template' };
    } catch (error) {
      console.error('WhatsApp template send error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Send auto-response to new lead
  async sendLeadWelcome(
    lead: any,
    teamMember: any
  ): Promise<SendMessageResult> {
    const adminClient = createAdminClient();

    try {
      // Get team member's WhatsApp account
      const { data: account } = await adminClient
        .from('whatsapp_accounts')
        .select('*')
        .eq('id', teamMember.whatsapp_account_id)
        .single();

      if (!account) {
        // Fallback to primary account
        const { data: primaryAccount } = await adminClient
          .from('whatsapp_accounts')
          .select('*')
          .eq('is_primary', true)
          .eq('is_active', true)
          .single();

        if (!primaryAccount) {
          return { success: false, error: 'No WhatsApp account available' };
        }

        return this.sendTemplateMessage(
          primaryAccount.id,
          lead.phone,
          'welcome_lead',
          [
            lead.full_name,
            teamMember.user?.full_name || 'our team',
            lead.interested_products?.[0] || 'our products',
          ],
          lead.id,
          teamMember.user_id
        );
      }

      return this.sendTemplateMessage(
        account.id,
        lead.phone,
        'welcome_lead',
        [
          lead.full_name,
          teamMember.user?.full_name || 'our team',
          lead.interested_products?.[0] || 'our products',
        ],
        lead.id,
        teamMember.user_id
      );
    } catch (error) {
      console.error('Lead welcome error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Process incoming webhook message
  async processIncomingMessage(payload: any): Promise<void> {
    const adminClient = createAdminClient();

    try {
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages?.[0]) return;

      const message = value.messages[0];
      const contact = value.contacts?.[0];
      const metadata = value.metadata;

      // Find WhatsApp account
      const { data: account } = await adminClient
        .from('whatsapp_accounts')
        .select('*')
        .eq('phone_number_id', metadata.phone_number_id)
        .single();

      if (!account) {
        console.error('WhatsApp account not found for:', metadata.phone_number_id);
        return;
      }

      // Get or create conversation
      const { data: conversation } = await adminClient
        .from('whatsapp_conversations')
        .upsert({
          whatsapp_account_id: account.id,
          contact_phone: message.from,
          contact_name: contact?.profile?.name,
          contact_wa_id: contact?.wa_id,
          status: 'open',
          last_customer_message_at: new Date().toISOString(),
          window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }, {
          onConflict: 'whatsapp_account_id,contact_phone',
        })
        .select('*, lead_id')
        .single();

      if (!conversation) return;

      // Extract message content
      let content = '';
      let mediaUrl = '';
      let mediaType = '';

      switch (message.type) {
        case 'text':
          content = message.text?.body || '';
          break;
        case 'image':
          content = message.image?.caption || '';
          mediaType = 'image';
          // Would need to download media using media ID
          break;
        case 'document':
          content = message.document?.caption || '';
          mediaType = 'document';
          break;
        case 'audio':
          mediaType = 'audio';
          break;
        case 'video':
          content = message.video?.caption || '';
          mediaType = 'video';
          break;
        case 'location':
          content = `Location: ${message.location?.latitude}, ${message.location?.longitude}`;
          break;
        case 'interactive':
          content = message.interactive?.button_reply?.title || 
                   message.interactive?.list_reply?.title || '';
          break;
      }

      // Save message
      await adminClient.from('whatsapp_messages').insert({
        conversation_id: conversation.id,
        whatsapp_account_id: account.id,
        wa_message_id: message.id,
        direction: 'inbound',
        message_type: message.type,
        content,
        media_id: message[message.type]?.id,
        media_mime_type: message[message.type]?.mime_type,
        sender_name: contact?.profile?.name,
        sender_phone: message.from,
        status: 'received',
      });

      // Update account stats
      await adminClient
        .from('whatsapp_accounts')
        .update({
          messages_received: account.messages_received + 1,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      // If no lead associated, try to find or create one
      if (!conversation.lead_id) {
        const { data: existingLead } = await adminClient
          .from('leads')
          .select('id')
          .eq('phone', message.from)
          .single();

        if (existingLead) {
          await adminClient
            .from('whatsapp_conversations')
            .update({ lead_id: existingLead.id })
            .eq('id', conversation.id);
        } else {
          // Create new lead from WhatsApp message
          const { data: newLead } = await adminClient
            .from('leads')
            .insert({
              full_name: contact?.profile?.name || 'WhatsApp User',
              phone: message.from,
              source: 'whatsapp',
              notes: `First message: ${content}`,
            })
            .select('id')
            .single();

          if (newLead) {
            await adminClient
              .from('whatsapp_conversations')
              .update({ lead_id: newLead.id })
              .eq('id', conversation.id);
          }
        }
      }

      // Send notification to assigned team member
      if (account.assigned_to) {
        await this.sendNewMessageNotification(account.assigned_to, conversation, content);
      }

      // Check for auto-reply
      if (account.auto_reply_enabled && account.auto_reply_message) {
        // Check business hours if enabled
        if (account.business_hours_only) {
          const now = new Date();
          const hours = now.getHours();
          const startHour = parseInt(account.business_hours_start?.split(':')[0] || '9');
          const endHour = parseInt(account.business_hours_end?.split(':')[0] || '18');

          if (hours < startHour || hours >= endHour) {
            await this.sendTextMessage(
              account.id,
              message.from,
              account.auto_reply_message,
              conversation.id
            );
          }
        }
      }
    } catch (error) {
      console.error('Process incoming message error:', error);
    }
  }

  // Process message status update
  async processStatusUpdate(payload: any): Promise<void> {
    const adminClient = createAdminClient();

    try {
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const statuses = changes?.value?.statuses;

      if (!statuses?.[0]) return;

      const status = statuses[0];

      const updateData: Record<string, any> = {
        status: status.status,
      };

      if (status.status === 'delivered') {
        updateData.delivered_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
      } else if (status.status === 'read') {
        updateData.read_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
      } else if (status.status === 'failed') {
        updateData.error_code = status.errors?.[0]?.code;
        updateData.error_message = status.errors?.[0]?.message;
      }

      await adminClient
        .from('whatsapp_messages')
        .update(updateData)
        .eq('wa_message_id', status.id);
    } catch (error) {
      console.error('Process status update error:', error);
    }
  }

  // Send notification to team member about new message
  private async sendNewMessageNotification(
    teamMemberId: string,
    conversation: any,
    messagePreview: string
  ): Promise<void> {
    const adminClient = createAdminClient();

    try {
      const { data: teamMember } = await adminClient
        .from('team_members')
        .select('user_id')
        .eq('id', teamMemberId)
        .single();

      if (teamMember) {
        await adminClient.from('notifications').insert({
          user_id: teamMember.user_id,
          type: 'whatsapp_message',
          title: 'New WhatsApp Message',
          message: `${conversation.contact_name || conversation.contact_phone}: ${messagePreview.substring(0, 100)}`,
          data: {
            conversation_id: conversation.id,
            contact_phone: conversation.contact_phone,
          },
          priority: 'high',
          action_url: `/admin/crm/whatsapp/${conversation.id}`,
          action_type: 'open_conversation',
          sound: 'message',
        });
      }
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }

  // Format phone number to E.164 format
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if missing
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned; // India
    }

    return cleaned;
  }

  // Get conversation history
  async getConversationMessages(
    conversationId: string,
    limit = 50,
    before?: string
  ) {
    const adminClient = createAdminClient();

    let query = adminClient
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.reverse() || [];
  }

  // Mark conversation as read
  async markConversationRead(conversationId: string): Promise<void> {
    const adminClient = createAdminClient();

    await adminClient
      .from('whatsapp_conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
  }

  // Get quick replies for team member
  async getQuickReplies(teamMemberId?: string) {
    const adminClient = createAdminClient();

    const { data } = await adminClient
      .from('whatsapp_quick_replies')
      .select('*')
      .or(`team_member_id.is.null,team_member_id.eq.${teamMemberId || 'null'}`)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    return data || [];
  }
}

export const whatsappService = new WhatsAppService();