import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type TaskInput = {
  title: string;
  description?: string;
  assigned_to?: string;
  lead_id?: string;
  order_id?: string;
  task_type?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_at?: string;
  meta?: any;
};

export async function createAutoTask(input: TaskInput) {
  const { error } = await supabase.from('tasks').insert({
    title: input.title,
    description: input.description || null,
    assigned_to: input.assigned_to || null,
    lead_id: input.lead_id || null,
    order_id: input.order_id || null,
    task_type: input.task_type || 'system',
    priority: input.priority || 'medium',
    status: 'pending',
    due_at: input.due_at || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    meta: input.meta || {},
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('AutoTask error:', error);
    throw error;
  }
}
