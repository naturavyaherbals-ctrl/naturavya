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

    const { data: logEntry } = await adminClient
      .from('meta_webhook_events')
      .insert({
        event_type: body.object,
        payload: body,
        processed: false,
      })
      .select('id')
      .single();

    if (body.object === 'page' || body.object === 'instagram') {
      await processLeadGenWebhook(body, logEntry?.id || undefined);
    } else if (body.object === 'whatsapp_business_account') {
      await processWhatsAppWebhook(body, logEntry?.id || undefined);
    }

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

// ------------------------
// Lead Gen webhook handler
// ------------------------
async function processLeadGenWebhook(body: any, logId?: string) {
  const adminClient = createAdminClient();

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen') continue;

        const leadgenData = change.value;

        // 1) Form config (mapping + tags + auto‑respond)
        const { data: formConfig } = await adminClient
          .from('meta_lead_forms')
          .select(
            `
            *,
            assignment_rule:lead_assignment_rules(*),
            default_assignee:team_members(*, user:users(*))
          `
          )
          .eq('form_id', leadgenData.form_id)
          .single();

        // 2) Lead detail from Meta Graph
        const leadData = await fetchLeadData(
          leadgenData.leadgen_id,
          entry.id
        );

        // 3) Field mapping → our columns
        const fieldMapping = formConfig?.field_mapping || {};
        const mappedData: Record<string, any> = {};

        for (const [metaField, ourField] of Object.entries(fieldMapping)) {
          const field = leadData?.field_data?.find(
            (f: any) => f.name === metaField
          );
          if (field) {
            mappedData[ourField as string] = field.values?.[0];
          }
        }

        const fullName =
          mappedData.full_name || mappedData.name || 'Unknown';
        const phone =
          mappedData.phone || mappedData.phone_number || '';

        // 4) Insert into leads table (match existing schema)
        const { data: newLead, error: leadError } = await adminClient
          .from('leads')
          .insert({
            full_name: fullName,
            phone,
            email: mappedData.email || null,
            city: mappedData.city || null,
            state: mappedData.state || null,
            address: mappedData.address || null,
            source: 'meta_ads',
            // Use campaign/ad/adset fields from webhook/graph if available
            campaign_name:
              leadgenData.campaign_name || leadData?.campaign_name || null,
            source_campaign:
              leadgenData.campaign_name || leadData?.campaign_name || null,
            ad_id: leadgenData.ad_id || leadData?.ad_id || null,
            adset_id: leadgenData.adset_id || leadData?.adset_id || null,
            form_id: leadgenData.form_id || null,
            form_name:
              leadgenData.form_name || formConfig?.name || null,
            raw_data: {
              ...leadgenData,
              ...leadData,
              meta_lead_id: leadgenData.leadgen_id,
            },
            tags: formConfig?.auto_tags || null,
            status: 'new',
            priority: 8, // high priority for ad leads
          })
          .select('*')
          .single();

        if (leadError || !newLead) {
          console.error('Lead creation error:', leadError);
          throw leadError;
        }

        // 5) Trigger AI scorer edge function (optional)
        if (
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.SUPABASE_SERVICE_ROLE_KEY
        ) {
          fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-lead-scorer`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ lead_id: newLead.id }),
            }
          ).catch((err) =>
            console.error('Error calling ai-lead-scorer function:', err)
          );
        }

        // 6) Update form stats
        if (formConfig) {
          await adminClient
            .from('meta_lead_forms')
            .update({
              total_leads: (formConfig.total_leads || 0) + 1,
              leads_today: (formConfig.leads_today || 0) + 1,
              last_lead_at: new Date().toISOString(),
            })
            .eq('id', formConfig.id);
        }

        // 7) Assign lead
        let assignmentResult;
        if (formConfig?.default_assignee) {
          assignmentResult = await leadAssignmentService.reassignLead(
            newLead.id,
            formConfig.default_assignee.id,
            'Default form assignment'
          );
        } else {
          assignmentResult = await leadAssignmentService.assignLead(
            newLead
          );
        }

        // 8) Schedule follow-up sequences (trigger_event = 'new_lead')
        try {
          const temperature =
            newLead.temperature ||
            (newLead.score >= 75
              ? 'hot'
              : newLead.score >= 45
              ? 'warm'
              : 'cold');

          const { data: sequences, error: seqError } = await adminClient
            .from('follow_up_sequences')
            .select('*')
            .eq('trigger_event', 'new_lead')
            .or(`temperature.eq.${temperature},temperature.is.null`)
            .eq('is_active', true);

          if (seqError) {
            console.error('Error loading follow_up_sequences:', seqError);
          } else if (sequences && sequences.length > 0) {
            const now = Date.now();
            const followUps = sequences.map((seq) => ({
              lead_id: newLead.id,
              sequence_id: seq.id,
              scheduled_at: new Date(
                now + (seq.delay_minutes || 0) * 60_000
              ).toISOString(),
              channel: seq.channel || 'whatsapp',
              status: 'pending',
              message_content: seq.message_template,
            }));

            await adminClient
              .from('scheduled_follow_ups')
              .insert(followUps);
          }
        } catch (err) {
          console.error('Error scheduling follow-up sequences:', err);
        }

        // 9) Log assignment into webhook event
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

        // 10) Optional auto WhatsApp welcome
        if (
          formConfig?.auto_respond &&
          formConfig?.auto_response_template_id &&
          assignmentResult.teamMember
        ) {
          const delay =
            (formConfig.auto_response_delay_seconds || 30) * 1000;

          setTimeout(async () => {
            try {
              await whatsappService.sendLeadWelcome(
                newLead,
                assignmentResult.teamMember
              );
            } catch (err) {
              console.error('Auto WhatsApp welcome error:', err);
            }
          }, delay);
        }
      }
    }
  } catch (error) {
    console.error('Process lead gen error:', error);
    throw error;
  }
}

// ---------------------------
// WhatsApp webhook handler
// ---------------------------
async function processWhatsAppWebhook(body: any, logId?: string) {
  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.value?.messages) {
          await whatsappService.processIncomingMessage(body);
        } else if (change.value?.statuses) {
          await whatsappService.processStatusUpdate(body);
        }
      }
    }
  } catch (error) {
    console.error('Process WhatsApp webhook error:', error);
    throw error;
  }
}

// ---------------------------
// Fetch lead from Meta Graph
// ---------------------------
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