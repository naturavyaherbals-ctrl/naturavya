import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(
  _req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY not set' },
        { status: 500 }
      );
    }

    const { leadId } = params;
    const supabase = createAdminClient();

    // 1) Fetch lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      console.error('Lead fetch error (AI):', error);
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // 2) Build prompt for Naturavya Ayurvedic telesales script
    const systemPrompt = `
You are an expert Ayurvedic telesales coach for Naturavya, an Ayurvedic D2C brand in India.
Your goal: help a human agent close COD/prepaid orders, reduce RTO, and build trust.

Rules:
- Tone: warm, clear, Indian, simple Hindi+English mix (Hinglish) but use Latin script only.
- Focus on: pain points, benefits, ingredients briefly, dosage, realistic expectations.
- Push for order confirmation and correct address.
- Handle common objections: "soch ke batata hun", "abhi busy hun", "pehle try karunga", "price zyada hai", "ghar pe consult karna hai".
- Keep things concise, bullet-style where useful.

You must respond ONLY in valid JSON.
`;

    const leadPayload = {
      id: lead.id,
      name: lead.full_name,
      phone: lead.phone,
      city: lead.city,
      state: lead.state,
      source: lead.source,
      campaign_name: lead.campaign_name || lead.source_campaign,
      interested_products: lead.interested_products,
      interested_categories: lead.interested_categories,
      budget_range: lead.budget_range,
      status: lead.status,
      temperature: lead.temperature,
      score: lead.score,
      engagement_score: lead.engagement_score,
      website_visits: lead.website_visits,
      whatsapp_responses: lead.whatsapp_responses,
      call_attempts: lead.call_attempts,
      notes: lead.notes,
    };

    const userPrompt = `
Use this lead data to generate a Naturavya-specific telesales plan.

Lead JSON:
${JSON.stringify(leadPayload, null, 2)}

Return STRICT JSON with this shape:
{
  "script": "full call script in Hinglish, with greeting, discovery questions, product pitch, dosage, price, COD/prepaid confirmation, address confirmation, and closing.",
  "next_action": "1-2 line clear instruction for the agent on what to do next.",
  "insights": [
    "short bullet about lead quality / intent / risk",
    "short bullet about possible objections",
    "short bullet about best angle to pitch (e.g. pain relief, hair fall, digestion, etc.)"
  ]
}
`;

    // 3) Call OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt.trim() },
          { role: 'user', content: userPrompt.trim() },
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      console.error('OpenAI API error:', txt);
      return NextResponse.json(
        { success: false, error: 'OpenAI API error' },
        { status: 500 }
      );
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('AI JSON parse error. Content:', content);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const script =
      parsed.script || parsed.call_script || parsed.message || '';
    const nextAction =
      parsed.next_action || parsed.next_best_action || '';
    const insights =
      parsed.insights || parsed.bullets || [];

    // Ensure insights is an array
    const insightsArray = Array.isArray(insights) ? insights : [String(insights)];

    // 4) Save into leads table
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        ai_suggested_message: script,
        ai_suggested_action: nextAction,
        ai_insights: insightsArray,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select('*, assigned_team_member:team_members(id, name, email)')
      .single();

    if (updateError || !updatedLead) {
      console.error('Lead AI update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save AI output' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (err: any) {
    console.error('POST /api/admin/leads/[leadId]/ai error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}