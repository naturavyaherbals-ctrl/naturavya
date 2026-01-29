import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY not set' },
        { status: 500 }
      );
    }

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
    const messages = (body.messages || []) as { role: string; content: string }[];
    const leadId = body.lead_id as string | undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No messages' },
        { status: 400 }
      );
    }

    // Optional: pull a lead for context
    let leadContext: any = null;
    if (leadId) {
      const { data: lead } = await supabase
        .from('leads')
        .select(
          'id, full_name, phone, city, state, source, campaign_name, source_campaign, status, temperature, score, notes'
        )
        .eq('id', leadId)
        .single();
      if (lead) leadContext = lead;
    }

    const systemPrompt = `
You are an internal sales assistant for Naturavya, an Ayurvedic D2C brand in India.

You are used by call center agents and admins INSIDE the Naturavya CRM.

Goals:
- Help agents close orders (especially COD), reduce RTO, and manage follow-ups.
- Give concrete call scripts in simple Hinglish (Latin script).
- Help interpret lead details, statuses, and ads performance, but do NOT invent data that is not passed.
- When asked about process, be practical and step-by-step.
- Never share internal API keys or code.

If lead context is provided, use it. If not, answer generally for Naturavya.

Always respond in concise Hinglish (Roman script), easy for Indian phone agents to read.
    `.trim();

    const contextBlock = leadContext
      ? `Current lead:\n${JSON.stringify(leadContext, null, 2)}`
      : 'No specific lead passed. Answer generally for Naturavya sales team.';

    const userAugmentedMessages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'system',
        content: contextBlock,
      },
      ...messages,
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: userAugmentedMessages,
        temperature: 0.6,
      }),
    });

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      console.error('AI chat error:', txt);
      return NextResponse.json(
        { success: false, error: 'AI API error' },
        { status: 500 }
      );
    }

    const openaiJson: any = await openaiRes.json();
    const reply =
      openaiJson.choices?.[0]?.message?.content ||
      'Sorry, AI reply not available right now.';

    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    console.error('POST /api/admin/ai/chat error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}