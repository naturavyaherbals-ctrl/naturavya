export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { leadid: string } }
) {
  try {
    const leadId = params.leadid;

    /* ======================
       Fetch Lead
    ====================== */

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    /* ======================
       Build Prompt
    ====================== */

    const prompt = `
You are a sales expert for Naturavya Herbals.

Customer Name: ${lead.full_name}
Phone: ${lead.phone}
City: ${lead.city || 'N/A'}
Status: ${lead.status}
Temperature: ${lead.temperature}
Score: ${lead.score}

Create a professional WhatsApp sales message
to convert this lead into customer.
Make it polite, convincing and short.
    `;

    /* ======================
       Call Dify
    ====================== */

    const difyRes = await fetch(process.env.DIFY_API_URL!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: prompt,
        response_mode: 'blocking',
        user: leadId,
      }),
    });

    if (!difyRes.ok) {
      const err = await difyRes.text();
      console.error('Dify Error:', err);

      return NextResponse.json(
        { error: 'Dify API failed', details: err },
        { status: 500 }
      );
    }

    const result = await difyRes.json();

    const aiMessage =
      result.answer ||
      result.data?.answer ||
      'Unable to generate message';

    /* ======================
       Save to DB
    ====================== */

    await supabase
      .from('leads')
      .update({
        ai_suggested_message: aiMessage,
      })
      .eq('id', leadId);

    return NextResponse.json({
      success: true,
      message: aiMessage,
    });

  } catch (err: any) {
    console.error('AI Route Error:', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
