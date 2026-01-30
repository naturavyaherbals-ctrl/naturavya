// app/api/tasks/today/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user' },
        { status: 401 }
      );
    }

    const now = new Date();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .eq('status', 'pending')
      .lte('due_at', now.toISOString())
      .order('priority', { ascending: false })
      .order('due_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
    });
  } catch (e) {
    console.error('Fetch today tasks error:', e);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
