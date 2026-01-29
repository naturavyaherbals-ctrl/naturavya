import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const LLM_BASE_URL = process.env.LLM_BASE_URL; 
const LLM_MODEL = process.env.LLM_MODEL;       

export async function POST(
  _req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const { leadId } = params;
    const supabase = createAdminClient();

    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // 1. Ultra-simplified prompt for the tiny model
    const userPrompt = `
Task: Create sales script for ${lead.full_name}. 
Category: ${lead.interested_categories?.[0] || 'Ayurveda'}. 
Rule: Output valid JSON ONLY.

{
  "script": "1. Hello... 2. Solve... 3. Product... 4. COD link",
  "next_action": "Call now",
  "insights": ["High intent"]
}
`.trim();

    // 2. Call VPS with a timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s limit

    const llmRes = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.1,
        max_tokens: 200,
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const llmData = await llmRes.json();
    let content = llmData.choices?.[0]?.message?.content || '{}';
    
    // 3. Robust JSON Extraction
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]);

      // 4. Update Database
      const { data: updatedLead } = await supabase
        .from('leads')
        .update({
          ai_suggested_message: parsed.script || "Script error",
          ai_suggested_action: parsed.next_action || "Follow up",
          ai_insights: parsed.insights || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select('*')
        .single();

      return NextResponse.json({ success: true, lead: updatedLead });
    } catch (parseErr) {
      console.error("Parse error. AI sent:", content);
      return NextResponse.json({ error: 'AI busy. Try again.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Naturavya AI Error:', error.name === 'AbortError' ? 'Timeout' : error);
    return NextResponse.json({ error: 'AI Brain too slow' }, { status: 500 });
  }
}