import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClient } from '@/lib/supabase/client';

export class LeadService {
  private async getSupabase() {
    if (typeof window === 'undefined') {
      return await createServerSupabaseClient();
    }
    return getClient();
  }

  async getLeads(filters?: any) {
    const adminClient = createAdminClient(); // Admin stats usually need service_role
    let query = adminClient.from('leads').select('*, assigned_team_member:team_members(*, user:users(*))', { count: 'exact' });
    // ... rest of your logic
    return await query;
  }

  async getLeadStats() {
    const adminClient = createAdminClient();
    const { count: totalLeads } = await adminClient.from('leads').select('*', { count: 'exact', head: true });
    const { count: newLeads } = await adminClient.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new');
    return { totalLeads: totalLeads || 0, newLeads: newLeads || 0 };
  }
}

export const leadService = new LeadService();