import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', user?.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from('agent_daily_performance')
    .select('*')
    .eq('agent_id', member.id)
    .eq('day', today)
    .single();

  return NextResponse.json({ data });
}
