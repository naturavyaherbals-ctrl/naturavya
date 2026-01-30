import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    // 🔐 Auth user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔎 Get team member
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 403 });
    }

    // 🧠 Only agent / manager
    if (!['agent', 'manager'].includes(member.role)) {
      return NextResponse.json({ tasks: [] });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 📋 Fetch pending tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        id,
        task_type,
        title,
        description,
        priority,
        due_at,
        lead_id,
        order_id
      `)
      .eq('assigned_to', member.id)
      .eq('status', 'pending')
      .gte('due_at', todayStart.toISOString())
      .order('priority', { ascending: false })
      .order('due_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ tasks });
  } catch (e: any) {
    console.error('Today tasks error:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
