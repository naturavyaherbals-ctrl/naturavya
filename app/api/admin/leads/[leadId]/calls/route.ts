import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CALL_BUCKET = 'call-recordings';

export async function POST(
  req: NextRequest,
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
    const supabase = await createServerSupabaseClient();

    // Auth → map to team member
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

    const { data: member } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const teamMemberId = member?.id || null;

    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Missing audio file' },
        { status: 400 }
      );
    }

    const direction =
      (form.get('direction') as string | null) || 'outbound';
    const callType =
      (form.get('call_type') as string | null) || 'phone';
    const status =
      (form.get('status') as string | null) || 'completed';
    const durationSecondsRaw =
      (form.get('duration_seconds') as string | null) ||
      (form.get('duration') as string | null);
    const startedAtRaw = form.get('started_at') as string | null;
    const endedAtRaw = form.get('ended_at') as string | null;

    const startedAt =
      startedAtRaw || new Date().toISOString();
    const endedAt = endedAtRaw || null;
    const durationSeconds = durationSecondsRaw
      ? Number(durationSecondsRaw)
      : null;

    // 1) Upload recording to Storage
    const ext = file.name.split('.').pop() || 'm4a';
    const path = `${leadId}/${Date.now()}.${ext}`;

    const uploadRes = await supabase.storage
      .from(CALL_BUCKET)
      .upload(path, file, {
        contentType: file.type || 'audio/mpeg',
        upsert: false,
      });

    if (uploadRes.error) {
      console.error('Storage upload error:', uploadRes.error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload recording' },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(CALL_BUCKET)
      .getPublicUrl(path);

    const recordingUrl = publicUrlData.publicUrl;

    // 2) Whisper transcription
    const whisperForm = new FormData();
    whisperForm.append('file', file);
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('response_format', 'json');

    const whisperRes = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: whisperForm,
      }
    );

    if (!whisperRes.ok) {
      const txt = await whisperRes.text();
      console.error('Whisper error:', txt);
      return NextResponse.json(
        { success: false, error: 'Whisper API error' },
        { status: 500 }
      );
    }

    const whisperJson: any = await whisperRes.json();
    const transcript: string =
      whisperJson.text || whisperJson.transcript || '';
    const transcriptLanguage: string | null =
      whisperJson.language || null;

    // 3) AI summary
    const systemPrompt = `
You are an assistant for Naturavya (Ayurvedic D2C brand in India).
Summarize sales calls in clear, short Hinglish (Latin script).
Focus on:
- customer problem & interest level
- products discussed
- pricing / objections
- final outcome
- what agent should do next.
Return STRICT JSON.
    `.trim();

    const userPrompt = `
Call transcript:
"""${transcript}"""

Return JSON:
{
  "summary": "2-4 line clear summary",
  "sentiment": "hot | warm | cold | negative | neutral",
  "next_action": "1-2 line instruction for agent"
}
    `.trim();

    const chatRes = await fetch(
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
          temperature: 0.4,
        }),
      }
    );

    if (!chatRes.ok) {
      const txt = await chatRes.text();
      console.error('Chat summary error:', txt);
      return NextResponse.json(
        { success: false, error: 'Summary API error' },
        { status: 500 }
      );
    }

    const chatJson: any = await chatRes.json();
    const content = chatJson.choices?.[0]?.message?.content || '{}';

    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Summary JSON parse error:', content);
    }

    const summary = parsed.summary || '';
    const sentiment = parsed.sentiment || null;
    const nextAction = parsed.next_action || '';

    // 4) Insert row into lead_calls
    const { data: call, error: insertError } = await supabase
      .from('lead_calls')
      .insert({
        lead_id: leadId,
        team_member_id: teamMemberId,
        direction,
        call_type: callType,
        status,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        recording_bucket: CALL_BUCKET,
        recording_path: path,
        recording_url: recordingUrl,
        transcript,
        transcript_language: transcriptLanguage,
        ai_summary: summary,
        ai_sentiment: sentiment,
        ai_next_action: nextAction,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('lead_calls insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save call log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, call });
  } catch (err: any) {
    console.error('POST /api/admin/leads/[leadId]/calls error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}