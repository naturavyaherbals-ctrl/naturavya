import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const LLM_BASE_URL = process.env.LLM_BASE_URL; 
const LLM_MODEL = process.env.LLM_MODEL;       

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminSupabase = createAdminClient(); 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('role, full_name').eq('id', user.id).single();
    const userRole = profile?.role || 'agent';
    const isAdmin = ['admin', 'super_admin'].includes(userRole);

    const body = await req.json();
    const messages = body.messages || [];
    const query = messages[messages.length - 1]?.content?.toLowerCase() || "";

    let context = "";

    // 1. PRODUCT KNOWLEDGE RETRIEVAL
    // Agar user kisi beemari ya product ke baare mein puche
    if (query.includes('product') || query.includes('bech') || query.includes('dawa') || query.includes('benefit') || query.includes('dosage')) {
      const { data: products } = await adminSupabase
        .from('products')
        .select('name, tagline, short_description, benefits, ingredients, dosage, price')
        .eq('is_active', true)
        .limit(5);
      
      context += `\nNATURAVYA PRODUCT CATALOG: ${JSON.stringify(products)}`;
    }

    // 2. LEAD & ORDER AUDIT (Mentioned a name?)
    const words = query.split(' ').filter(w => w.length > 2);
    let foundLead: any = null;
    for (const word of words) {
      const { data: lead } = await adminSupabase.from('leads').select('*').ilike('full_name', `%${word}%`).limit(1).maybeSingle();
      if (lead) { foundLead = lead; break; }
    }

    if (foundLead) {
      const { data: orders } = await adminSupabase.from('orders').select('order_number, status, total').or(`phone.eq.${foundLead.phone},customer_phone.eq.${foundLead.phone}`).limit(3);
      context += `\nCUSTOMER CONTEXT (${foundLead.full_name}): Status ${foundLead.status}, Score ${foundLead.score}. Orders: ${JSON.stringify(orders)}`;
    }

    // 3. ADS & TEAM PERFORMANCE (Admin only)
    if (isAdmin && (query.includes('ad') || query.includes('scale') || query.includes('performance'))) {
      const { data: ads } = await adminSupabase.from('lead_ads_performance_v').select('*').limit(3);
      context += `\nBUSINESS DATA: ${JSON.stringify(ads)}`;
    }

    // 4. THE NATURAVYA EXPERT PROMPT
    const systemPrompt = `
Tu "Naturavya Sales Brain" hai. Tera kaam staff ko expert banana hai.
Language: Strictly Roman Hinglish.

KNOWLEDGE RULES:
- Product Pitch: Agar koi product ke baare mein puche, toh context se uska "tagline" aur "benefits" batao.
- Dosage: Hamesha customer ko batao product kaise lena hai (Dosage field use kar).
- Trust: Pitch karo ki Naturavya 100% pure Ayurveda hai aur hamare products lab-certified hain.
- Sales: Hamesha agent ko bolo address double-check karein aur ₹1 link se COD verify karein.

LIVE DATABASE DATA:
${context || "No specific data found. Answer as Naturavya specialist."}
`.trim();

    // 5. CALL VPS
    const llmRes = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    const llmJson = await llmRes.json();
    const reply = llmJson.choices?.[0]?.message?.content || "Naturavya Brain thinking... please retry.";

    return NextResponse.json({ success: true, reply });

  } catch (error: any) {
    console.error('Master AI Error:', error);
    return NextResponse.json({ success: false, reply: "Brain offline hai. VPS check karein." }, { status: 500 });
  }
}