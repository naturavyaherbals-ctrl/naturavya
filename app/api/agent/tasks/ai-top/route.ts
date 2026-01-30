export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Team member
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!member || !['agent', 'manager'].includes(member.role)) {
      return NextResponse.json({ tasks: [] });
    }

    // Fetch pending tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', member.id)
      .eq('status', 'pending');

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    const now = new Date().getTime();

    // 🧠 AI-LIKE SCORING (Deterministic & safe)
    const scored = tasks.map((t: any) => {
      let score = 0;

      if (t.due_at) {
        const due = new Date(t.due_at).getTime();
        if (due < now) score += 40; // overdue
        else score += 20; // due today/future
      }

      if (t.task_type === 'rto_recovery') score += 50;
      if (t.task_type === 'delivery_check') score += 45;
      if (t.task_type === 'follow_up') score += 30;
      if (t.task_type === 'new_lead') score += 20;

      if (t.priority === 2) score += 25;
      if (t.priority === 1) score += 10;

      return { ...t, ai_score: score };
    });

    const top3 = scored
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, 3);

    return NextResponse.json({ tasks: top3 });
  } catch (e: any) {
    console.error('AI top tasks error:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to rank tasks' },
      { status: 500 }
    );
  }
}
