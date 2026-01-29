// supabase/functions/ai-lead-scorer/index.ts
// Edge function: enriches a lead with AI insights / next action after creation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for ai-lead-scorer');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    persistSession: false,
  },
});

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not set');
      return json({ success: false, error: 'OPENAI_API_KEY not set' }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const leadId = body.lead_id as string | undefined;

    if (!leadId) {
      return json({ success: false, error: 'lead_id is required' }, 400);
    }

    // 1) Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(
        `
        id,
        full_name,
        phone,
        email,
        city,
        state,
        address,
        source,
        campaign_name,
        source_campaign,
        temperature,
        score,
        notes,
        created_at
      `
      )
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('Lead fetch error in ai-lead-scorer:', leadError);
      return json({ success: false, error: 'Lead not found' }, 404);
    }

    // 2) Build prompt
    const systemPrompt = `
You are an assistant helping Naturavya (Ayurvedic D2C brand in India) qualify and guide sales teams.

Output short, clear Hinglish (Latin script).
Focus on:
- lead interest & strength
- main risk (RTO / wrong number / not serious)
- suggested next action for agent (call/WhatsApp, what to say).

Return STRICT JSON.
`.trim();

    const userPrompt = `
Lead JSON:
${JSON.stringify(lead, null, 2)}

Return JSON:
{
  "insights": [
    "short bullet about lead quality / intent",
    "short bullet about possible objections or risk",
    "short bullet about best angle to pitch"
  ],
  "next_action": "1-2 line instruction for Naturavya agent on what to do next call/WhatsApp."
}
`.trim();

    const openaiRes = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
        }),
      }
    );

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      console.error('OpenAI ai-lead-scorer error:', txt);
      return json({ success: false, error: 'OpenAI API error' }, 500);
    }

    const openaiJson: any = await openaiRes.json();
    const content = openaiJson.choices?.[0]?.message?.content || '{}';

    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('ai-lead-scorer JSON parse error. Content:', content);
      parsed = {};
    }

    const insights =
      (Array.isArray(parsed.insights) ? parsed.insights : []) as any[];
    const nextAction: string =
      parsed.next_action || parsed.next_best_action || '';

    // 3) Update lead row
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        ai_insights: insights,
        ai_suggested_action: nextAction || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('ai-lead-scorer update error:', updateError);
      return json(
        { success: false, error: 'Failed to update lead with AI insights' },
        500
      );
    }

    return json({ success: true });
  } catch (err: any) {
    console.error('ai-lead-scorer crash:', err);
    return json(
      { success: false, error: err.message || 'Internal Server Error' },
      500
    );
  }
});

function json(body: any, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}