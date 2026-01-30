import { NextRequest, NextResponse } from 'next/server';
import { createAutoTask } from '@/lib/tasks/auto-create-task';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { type, lead } = body;

    if (!lead?.id) {
      return NextResponse.json({ error: 'Lead missing' }, { status: 400 });
    }

    /* ===== NEW LEAD ===== */
    if (type === 'new_lead') {
      await createAutoTask({
        title: 'Call new lead',
        description: 'New lead received. Call within 10 minutes.',
        lead_id: lead.id,
        assigned_to: lead.assigned_to,
        task_type: 'lead_call',
        priority: 'high',
        meta: { source: lead.source },
      });
    }

    /* ===== FOLLOW UP ===== */
    if (type === 'follow_up') {
      await createAutoTask({
        title: 'Follow-up customer',
        description: 'Scheduled follow-up due',
        lead_id: lead.id,
        assigned_to: lead.assigned_to,
        task_type: 'follow_up',
        priority: 'medium',
        meta: { follow_up_at: lead.next_follow_up },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Lead trigger task error', e);
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
