import { createAdminClient } from '@/lib/supabase/admin';
import { getClient } from '@/lib/supabase/client';
import { Lead, LeadActivity, LeadStatus, LeadSource, ActivityType, TeamMember } from '@/types/database';

export class LeadService {
  private supabase = getClient();

  async createLead(leadData: {
    fullName: string;
    phone: string;
    email?: string;
    alternatePhone?: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
    source?: LeadSource;
    sourceCampaign?: string;
    sourceAdset?: string;
    sourceAd?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    interestedProducts?: string[];
    interestedCategories?: string[];
    budgetRange?: string;
    metaLeadId?: string;
    rawData?: Record<string, any>;
    tags?: string[];
    notes?: string;
  }): Promise<Lead> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('leads')
      .insert({
        full_name: leadData.fullName,
        phone: leadData.phone,
        email: leadData.email || null,
        alternate_phone: leadData.alternatePhone || null,
        city: leadData.city || null,
        state: leadData.state || null,
        pincode: leadData.pincode || null,
        address: leadData.address || null,
        source: leadData.source || 'website',
        source_campaign: leadData.sourceCampaign || null,
        source_adset: leadData.sourceAdset || null,
        source_ad: leadData.sourceAd || null,
        utm_source: leadData.utmSource || null,
        utm_medium: leadData.utmMedium || null,
        utm_campaign: leadData.utmCampaign || null,
        interested_products: leadData.interestedProducts || null,
        interested_categories: leadData.interestedCategories || null,
        budget_range: leadData.budgetRange || null,
        meta_lead_id: leadData.metaLeadId || null,
        raw_data: leadData.rawData || null,
        tags: leadData.tags || null,
        notes: leadData.notes || null,
        status: 'new',
        priority: 5,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Lead;
  }

  async getLead(leadId: string): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(*, user:users(*)),
        activities:lead_activities(*, created_by_user:users(*)),
        order:orders(*)
      `)
      .eq('id', leadId)
      .single();

    if (error) return null;
    return data as Lead;
  }

  async getLeads(filters?: {
    status?: LeadStatus;
    assignedTo?: string;
    source?: LeadSource;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ leads: Lead[]; total: number }> {
    const adminClient = createAdminClient();

    let query = adminClient
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(*, user:users(*))
      `, { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) return { leads: [], total: 0 };
    return { leads: data as Lead[], total: count || 0 };
  }

  async updateLeadStatus(
    leadId: string,
    status: LeadStatus,
    notes?: string,
    userId?: string
  ): Promise<Lead | null> {
    const adminClient = createAdminClient();

    const updateData: Record<string, any> = { status };

    // Set next follow-up for follow_up status
    if (status === 'follow_up') {
      const nextFollowUp = new Date();
      nextFollowUp.setHours(nextFollowUp.getHours() + 24);
      updateData.next_follow_up = nextFollowUp.toISOString();
    }

    // Set conversion date for order_confirmed
    if (status === 'order_confirmed') {
      updateData.converted_at = new Date().toISOString();
    }

    const { data, error } = await adminClient
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select('*')
      .single();

    if (error) return null;

    // Log activity
    await this.addActivity(leadId, {
      activityType: 'status_change',
      title: `Status changed to ${status}`,
      description: notes,
      createdBy: userId,
    });

    return data as Lead;
  }

  async assignLead(
    leadId: string,
    teamMemberId: string,
    assignedBy?: string,
    reason?: string
  ): Promise<Lead | null> {
    const adminClient = createAdminClient();

    // Get current assignment for history
    const { data: currentLead } = await adminClient
      .from('leads')
      .select('assigned_to')
      .eq('id', leadId)
      .single();

    // Update lead
    const { data, error } = await adminClient
      .from('leads')
      .update({
        assigned_to: teamMemberId,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select('*')
      .single();

    if (error) return null;

    // Log assignment history
    await adminClient.from('lead_assignments_history').insert({
      lead_id: leadId,
      from_team_member: currentLead?.assigned_to || null,
      to_team_member: teamMemberId,
      reason,
      assigned_by: assignedBy,
    });

    // Log activity
    await this.addActivity(leadId, {
      activityType: 'assignment',
      title: 'Lead assigned',
      description: reason,
      createdBy: assignedBy,
    });

    return data as Lead;
  }

  async addActivity(
    leadId: string,
    activity: {
      activityType: ActivityType;
      title: string;
      description?: string;
      outcome?: string;
      durationSeconds?: number;
      scheduledAt?: string;
      completedAt?: string;
      createdBy?: string;
    }
  ): Promise<LeadActivity> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        activity_type: activity.activityType,
        title: activity.title,
        description: activity.description || null,
        outcome: activity.outcome || null,
        duration_seconds: activity.durationSeconds || null,
        scheduled_at: activity.scheduledAt || null,
        completed_at: activity.completedAt || new Date().toISOString(),
        created_by: activity.createdBy || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Update call attempts if it's a call
    if (activity.activityType === 'call') {
      await adminClient
        .from('leads')
        .update({
          call_attempts: adminClient.rpc('increment_call_attempts', { lead_id: leadId }),
          last_call_at: new Date().toISOString(),
        })
        .eq('id', leadId);
    }

    return data as LeadActivity;
  }

  async logCall(
    leadId: string,
    outcome: string,
    notes?: string,
    duration?: number,
    userId?: string
  ): Promise<LeadActivity> {
    return this.addActivity(leadId, {
      activityType: 'call',
      title: 'Phone call',
      description: notes,
      outcome,
      durationSeconds: duration,
      createdBy: userId,
    });
  }

  async scheduleFollowUp(
    leadId: string,
    scheduledAt: string,
    notes?: string,
    userId?: string
  ): Promise<Lead | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('leads')
      .update({
        next_follow_up: scheduledAt,
        status: 'follow_up',
      })
      .eq('id', leadId)
      .select('*')
      .single();

    if (error) return null;

    // Log activity
    await this.addActivity(leadId, {
      activityType: 'note',
      title: 'Follow-up scheduled',
      description: notes,
      scheduledAt,
      createdBy: userId,
    });

    return data as Lead;
  }

  async convertToOrder(
    leadId: string,
    orderId: string,
    userId?: string
  ): Promise<Lead | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('leads')
      .update({
        status: 'order_confirmed',
        converted_at: new Date().toISOString(),
        order_id: orderId,
      })
      .eq('id', leadId)
      .select('*')
      .single();

    if (error) return null;

    // Log activity
    await this.addActivity(leadId, {
      activityType: 'order_created',
      title: 'Order created',
      description: `Order ID: ${orderId}`,
      createdBy: userId,
    });

    return data as Lead;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('team_members')
      .select('*, user:users(*)')
      .eq('is_available', true);

    if (error) return [];
    return data as TeamMember[];
  }

  async getLeadStats(): Promise<{
    totalLeads: number;
    newLeads: number;
    followUpLeads: number;
    convertedLeads: number;
    conversionRate: number;
  }> {
    const adminClient = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    const { count: totalLeads } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true });

    const { count: newLeads } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    const { count: followUpLeads } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'follow_up');

    const { count: convertedLeads } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'order_confirmed');

    const conversionRate = totalLeads
      ? ((convertedLeads || 0) / totalLeads) * 100
      : 0;

    return {
      totalLeads: totalLeads || 0,
      newLeads: newLeads || 0,
      followUpLeads: followUpLeads || 0,
      convertedLeads: convertedLeads || 0,
      conversionRate,
    };
  }

  async getAgentPerformance(teamMemberId: string, dateRange?: {
    start: string;
    end: string;
  }): Promise<{
    leadsAssigned: number;
    leadsContacted: number;
    leadsConverted: number;
    conversionRate: number;
    totalCalls: number;
    avgResponseTime: number;
  }> {
    const adminClient = createAdminClient();

    let query = adminClient
      .from('leads')
      .select('*')
      .eq('assigned_to', teamMemberId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }

    const { data: leads } = await query;

    const leadsAssigned = leads?.length || 0;
    const leadsContacted = leads?.filter((l) => l.call_attempts > 0).length || 0;
    const leadsConverted = leads?.filter((l) => l.status === 'order_confirmed').length || 0;

    // Get total calls
    const { count: totalCalls } = await adminClient
      .from('lead_activities')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', 'call')
      .eq('created_by', teamMemberId);

    return {
      leadsAssigned,
      leadsContacted,
      leadsConverted,
      conversionRate: leadsAssigned ? (leadsConverted / leadsAssigned) * 100 : 0,
      totalCalls: totalCalls || 0,
      avgResponseTime: 0, // Calculate based on first activity time
    };
  }
}

export const leadService = new LeadService();