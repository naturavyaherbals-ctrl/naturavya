import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendWhatsapp(toRaw: string, text: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp env vars not configured');
  }

  let to = toRaw.replace(/\D/g, '');
  if (to.length === 10) {
    to = '91' + to;
  }

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

function buildMessage(template: string, lead: any): string {
  const name = lead.full_name || 'ji';
  const firstName = String(name).split(' ')[0] || name;

  let text = template;

  const replacements: Record<string, string> = {
    '{{name}}': name,
    '{{full_name}}': name,
    '{{first_name}}': firstName,
    '{{phone}}': lead.phone || '',
    '{{city}}': lead.city || '',
    '{{state}}': lead.state || '',
    '{{temperature}}': lead.temperature || '',
    '{{score}}': String(lead.score ?? ''),
  };

  for (const [key, value] of Object.entries(replacements)) {
    text = text.replace(new RegExp(key, 'g'), value);
  }

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const limit = Number(body.limit || 50);
    const nowISO = new Date().toISOString();

    // 1) Fetch pending, due follow-ups
    const { data: jobs, error: jobsError } = await supabase
      .from('scheduled_follow_ups')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', nowISO)
      .lt('attempts', 3)
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (jobsError) {
      console.error('scheduled_follow_ups query error:', jobsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch followups' },
        { status: 500 }
      );
    }

    const tasks = jobs || [];
    if (tasks.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        successCount: 0,
        failCount: 0,
        results: [],
      });
    }

    let successCount = 0;
    let failCount = 0;
    const results: any[] = [];

    for (const job of tasks) {
      const jobId = job.id;
      let ok = false;
      let providerMessageId: string | null = null;
      let errorMessage: string | null = null;
      let finalMessage: string | null = null;

      try {
        // 2) Load lead + sequence
        const [{ data: lead }, { data: seq }] = await Promise.all([
          supabase
            .from('leads')
            .select(
              'id, full_name, phone, city, state, temperature, score'
            )
            .eq('id', job.lead_id)
            .single(),
          supabase
            .from('follow_up_sequences')
            .select('id, message_template, channel')
            .eq('id', job.sequence_id)
            .single(),
        ]);

        if (!lead || !lead.phone) {
          throw new Error('Lead or phone missing');
        }

        if (!seq || (seq.channel && seq.channel !== 'whatsapp')) {
          throw new Error('Sequence missing or non-whatsapp channel');
        }

        const template =
          job.message_content || seq.message_template || '';
        if (!template) {
          throw new Error('Empty message template');
        }

        finalMessage = buildMessage(template, lead);

        // 3) Send via WhatsApp
        const sent = await sendWhatsapp(lead.phone, finalMessage);
        providerMessageId = sent.providerMessageId;
        ok = true;
      } catch (err: any) {
        console.error('Followup job failed', jobId, err);
        ok = false;
        errorMessage = err.message || 'Unknown error';
      }

      // 4) Update row
      const updatePayload: any = {
        attempts: (job.attempts || 0) + 1,
        executed_at: new Date().toISOString(),
        status: ok ? 'sent' : 'failed',
        last_error: ok ? null : errorMessage,
        provider_message_id: providerMessageId || job.provider_message_id,
      };
      if (finalMessage && !job.message_content) {
        updatePayload.message_content = finalMessage;
      }

      const { error: updErr } = await supabase
        .from('scheduled_follow_ups')
        .update(updatePayload)
        .eq('id', jobId);

      if (updErr) {
        console.error('scheduled_follow_ups update error:', updErr);
      }

      if (ok) successCount++;
      else failCount++;

      results.push({
        id: jobId,
        lead_id: job.lead_id,
        status: ok ? 'sent' : 'failed',
        error: errorMessage,
      });
    }

    return NextResponse.json({
      success: true,
      processed: tasks.length,
      successCount,
      failCount,
      results,
    });
  } catch (error: any) {
    console.error('POST /api/admin/followups/process error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}