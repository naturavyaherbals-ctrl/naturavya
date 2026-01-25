import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { leadAssignmentService } from '@/lib/services/leadAssignmentService';
import { whatsappService } from '@/lib/services/whatsappService';

// Verify webhook (GET request from Meta)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify token matches
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('Meta webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Receive events (POST request from Meta)
export async function POST(request: NextRequest) {
  const adminClient = createAdminClient();

  try {
    const body = await request.json();

    // Log the webhook event
    const { data: logEntry } = await adminClient
      .from('meta_webhook_events')
      .insert({
        event_type: body.object,
        payload: body,
        processed: false,
      })
      .select('id')
      .single();

    // Process based on object type
    if (body.object === 'page' || body.object === 'instagram') {
      // Lead Gen webhook
      await processLeadGenWebhook(body, logEntry?.id);
    } else if (body.object === 'whatsapp_business_account') {
      // WhatsApp webhook
      await processWhatsAppWebhook(body, logEntry?.id);
    }

    // Mark as processed
    if (logEntry?.id) {
      await adminClient
        .from('meta_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', logEntry.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Meta webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Process Lead Gen webhook
async function processLeadGenWebhook(body: any, logId?: string) {
  const adminClient = createAdminClient();

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadgenData = change.value;

          // Get form configuration
          const { data: formConfig } = await adminClient
            .from('meta_lead_forms')
            .select('*, assignment_rule:lead_assignment_rules(*), default_assignee:team_members(*, user:users(*))')
            .eq('form_id', leadgenData.form_id)
            .single();

          // Fetch lead data from Meta API if needed
          const leadData = await fetchLeadData(leadgenData.leadgen_id, entry.id);

          // Map fields based on form configuration
          const fieldMapping = formConfig?.field_mapping || {};
          const mappedData: Record<string, any> = {};

          for (const [metaField, ourField] of Object.entries(fieldMapping)) {
            const fieldData = leadData?.field_data?.find((f: any) => f.name === metaField);
            if (fieldData) {
              mappedData[ourField as string] = fieldData.values?.[0];
            }
          }

          // Create lead
          const { data: newLead, error: leadError } = await adminClient
            .from('leads')
            .insert({
              full_name: mappedData.full_name || mappedData.name || 'Unknown',
              phone: mappedData.phone || mappedData.phone_number || '',
              email: mappedData.email || null,
              city: mappedData.city || null,
              state: mappedData.state || null,
              address: mappedData.address || null,
              source: 'meta_ads',
              source_campaign: leadgenData.campaign_name || leadData?.campaign_name,
              source_adset: leadgenData.adset_name || leadData?.adset_name,
              source_ad: leadgenData.ad_name || leadData?.ad_name,
              meta_lead_id: leadgenData.leadgen_id,
              raw_data: {
                ...leadgenData,
                ...leadData,
              },
              tags: formConfig?.auto_tags || null,
              status: 'new',
              priority: 8, // High priority for ad leads
            })
            .select('*')
            .single();

          if (leadError) {
            console.error('Lead creation error:', leadError);
            throw leadError;
          }

          // Update form stats
          if (formConfig) {
            await adminClient
              .from('meta_lead_forms')
              .update({
                total_leads: formConfig.total_leads + 1,
                leads_today: formConfig.leads_today + 1,
                last_lead_at: new Date().toISOString(),
              })
              .eq('id', formConfig.id);
          }

          // Assign lead
          let assignmentResult;

          if (formConfig?.default_assignee) {
            // Use form's default assignee
            assignmentResult = await leadAssignmentService.reassignLead(
              newLead.id,
              formConfig.default_assignee.id,
              'Default form assignment'
            );
          } else {
            // Use assignment rules or round-robin
            assignmentResult = await leadAssignmentService.assignLead(newLead);
          }

          // Log assignment result
          if (logId) {
            await adminClient
              .from('meta_webhook_events')
              .update({
                processing_result: {
                  lead_id: newLead.id,
                  assigned_to: assignmentResult.teamMemberId,
                  success: assignmentResult.success,
                },
              })
              .eq('id', logId);
          }

          // Send auto-response via WhatsApp if configured
          if (formConfig?.auto_respond && formConfig?.auto_response_template_id && assignmentResult.teamMember) {
            // Delay before sending
            const delay = (formConfig.auto_response_delay_seconds || 30) * 1000;
            
            setTimeout(async () => {
              await whatsappService.sendLeadWelcome(newLead, assignmentResult.teamMember);
            }, delay);
          }
        }
      }
    }
  } catch (error) {
    console.error('Process lead gen error:', error);
    throw error;
  }
}

// Process WhatsApp webhook
async function processWhatsAppWebhook(body: any, logId?: string) {
  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.value?.messages) {
          // Incoming message
          await whatsappService.processIncomingMessage(body);
        } else if (change.value?.statuses) {
          // Message status update
          await whatsappService.processStatusUpdate(body);
        }
      }
    }
  } catch (error) {
    console.error('Process WhatsApp webhook error:', error);
    throw error;
  }
}

// Fetch lead data from Meta API
async function fetchLeadData(leadgenId: string, pageId: string) {
  try {
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.warn('META_PAGE_ACCESS_TOKEN not configured');
      return null;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${accessToken}`
    );

    if (!response.ok) {
      console.error('Failed to fetch lead data:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch lead data error:', error);
    return null;
  }
}