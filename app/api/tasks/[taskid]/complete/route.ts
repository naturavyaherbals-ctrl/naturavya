import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = params.taskId;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID missing' },
        { status: 400 }
      );
    }

    /* ================= COMPLETE TASK ================= */
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error('Task complete error:', error);
      return NextResponse.json(
        { error: 'Failed to complete task' },
        { status: 500 }
      );
    }

    /* ================= SUCCESS ================= */
    return NextResponse.json({
      success: true,
      task_id: taskId,
    });
  } catch (err: any) {
    console.error('Task complete API error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
