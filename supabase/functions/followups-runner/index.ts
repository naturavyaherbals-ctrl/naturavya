import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_CLOUD_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

function buildMessage(
  template: string,
  lead: any,
  sequence: any
): string {
  const name = lead.full_name || 'Customer';
  const firstName = String(name).split(' ')[0] || name;
  const product =
    (Array.isArray(lead.interested_products) &&
      lead.interested_products[0]) ||
    'our products';

  let msg = template;

  const replacements: Record<string, string> = {
    '{{name}}': name,
    '{{full_name}}': name,
    '{{first_name}}': firstName,
    '{{product}}': product,
    '{{phone}}': lead.phone || '',
    '{{city}}': lead.city || '',
    '{{state}}': lead.state || '',
    '{{temperature}}': lead.temperature || '',
    '{{score}}': String(lead.score ?? ''),
    '{{sequence_name}}': sequence.name || '',
  };

  for (const [k, v] of Object.entries(replacements)) {
    msg = msg.replace(new RegExp(k, 'g'), v);
  }

  return msg;
}

async function sendWhatsapp(toRaw: string, text: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp env vars not configured');
  }

  let to = toRaw.replace(/\D/g, '');
  if (to.length === 10) to = '91' + to;

  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('WhatsApp followup error:', json);
    throw new Error('WhatsApp API error');
  }

  const msgId = json.messages?.[0]?.id || null;
  return { providerMessageId: msgId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const nowISO = new Date().toISOString();

    const { data: pendingFollowUps, error } = await supabase
      .from('scheduled_follow_ups')
      .select(
        `
        *,
        lead:leads(
          id,
          full_name,
          phone,
          city,
          state,
          temperature,
          score,
          interested_products
        ),
        sequence:follow_up_sequences(
          id,
          name,
          message_template,
          channel
        )
      `
      )
      .eq('status', 'pending')
      .lte('scheduled_at', nowISO)
      .lt('attempts', 3)
      .limit(50);

    if (error) throw error;

    const results: any[] = [];

    for (const followUp of pendingFollowUps || []) {
      const lead = followUp.lead;
      const sequence = followUp.sequence;

      if (!lead || !sequence) continue;

      // Only WhatsApp channel for now
      const channel = followUp.channel || sequence.channel || 'whatsapp';
      if (channel !== 'whatsapp') continue;

      let message = '';
      let ok = false;
      let providerMessageId: string | null = null;
      let errMsg: string | null = null;

      try {
        const template =
          followUp.message_content || sequence.message_template || '';
        if (!template) throw new Error('Empty message template');

        message = buildMessage(template, lead, sequence);

        const sent = await sendWhatsapp(lead.phone, message);
        providerMessageId = sent.providerMessageId;
        ok = true;
      } catch (e: any) {
        console.error(
          'followups-runner send error for id',
          followUp.id,
          e
        );
        ok = false;
        errMsg = e.message || 'Unknown error';
      }

      // Update scheduled_follow_ups row
      const { error: updErr } = await supabase
        .from('scheduled_follow_ups')
        .update({
          status: ok ? 'sent' : 'failed',
          executed_at: new Date().toISOString(),
          message_content: message || followUp.message_content,
          attempts: (followUp.attempts || 0) + 1,
          last_error: ok ? null : errMsg,
          provider_message_id:
            providerMessageId || followUp.provider_message_id,
        })
        .eq('id', followUp.id);

      if (updErr) {
        console.error('scheduled_follow_ups update error:', updErr);
      }

      // Log activity (only on success)
      if (ok) {
        await supabase.from('lead_activities').insert({
          lead_id: lead.id,
          activity_type: 'whatsapp',
          title: 'Auto follow-up sent',
          description: `Sequence: ${sequence.name || 'Unknown'}`,
        });
      }

      results.push({
        id: followUp.id,
        status: ok ? 'sent' : 'failed',
        error: errMsg,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('followups-runner crash:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});