import { createAdminClient } from '@/lib/supabase/admin';
import { whatsappService } from './whatsappService';

interface AssignmentResult {
  success: boolean;
  teamMemberId?: string;
  teamMember?: any;
  error?: string;
}

export class LeadAssignmentService {
  // Assign lead based on rules
  async assignLead(lead: any): Promise<AssignmentResult> {
    const adminClient = createAdminClient();

    try {
      // Get active assignment rules sorted by priority
      const { data: rules } = await adminClient
        .from('lead_assignment_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      let assignedTeamMemberId: string | null = null;

      // Check each rule
      for (const rule of rules || []) {
        if (this.matchesRule(lead, rule.conditions)) {
          assignedTeamMemberId = await this.executeRuleAction(rule, lead);
          
          if (assignedTeamMemberId) {
            // Update rule stats
            await adminClient
              .from('lead_assignment_rules')
              .update({
                times_matched: rule.times_matched + 1,
                last_matched_at: new Date().toISOString(),
              })
              .eq('id', rule.id);
            break;
          }
        }
      }

      // Fallback to round-robin if no rule matched
      if (!assignedTeamMemberId) {
        const { data: nextMember } = await adminClient.rpc('get_next_assignee', {
          pool: 'default',
        });
        assignedTeamMemberId = nextMember;
      }

      if (!assignedTeamMemberId) {
        return { success: false, error: 'No available team members' };
      }

      // Get team member details
      const { data: teamMember } = await adminClient
        .from('team_members')
        .select('*, user:users(*), whatsapp_account:whatsapp_accounts(*)')
        .eq('id', assignedTeamMemberId)
        .single();

      if (!teamMember) {
        return { success: false, error: 'Team member not found' };
      }

      // Update lead with assignment
      await adminClient
        .from('leads')
        .update({
          assigned_to: assignedTeamMemberId,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      // Update team member's current lead count
      await adminClient
        .from('team_members')
        .update({
          current_lead_count: teamMember.current_lead_count + 1,
        })
        .eq('id', assignedTeamMemberId);

      // Log activity
      await adminClient.from('lead_activities').insert({
        lead_id: lead.id,
        activity_type: 'assignment',
        title: 'Lead auto-assigned',
        description: `Assigned to ${teamMember.user?.full_name}`,
      });

      // Send notification to team member
      await this.sendAssignmentNotification(teamMember, lead);

      // Send welcome WhatsApp message to lead
      if (teamMember.whatsapp_account_id) {
        await whatsappService.sendLeadWelcome(lead, teamMember);
      }

      return {
        success: true,
        teamMemberId: assignedTeamMemberId,
        teamMember,
      };
    } catch (error) {
      console.error('Lead assignment error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Check if lead matches rule conditions
  private matchesRule(lead: any, conditions: any[]): boolean {
    if (!conditions || conditions.length === 0) return false;

    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(lead, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        case 'starts_with':
          return String(fieldValue).toLowerCase().startsWith(String(condition.value).toLowerCase());
        case 'ends_with':
          return String(fieldValue).toLowerCase().endsWith(String(condition.value).toLowerCase());
        case 'is_empty':
          return !fieldValue || fieldValue === '';
        case 'is_not_empty':
          return fieldValue && fieldValue !== '';
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  // Get field value from lead object (supports nested fields)
  private getFieldValue(lead: any, field: string): any {
    const parts = field.split('.');
    let value = lead;
    
    for (const part of parts) {
      if (value === null || value === undefined) return null;
      value = value[part];
    }
    
    return value;
  }

  // Execute rule action
  private async executeRuleAction(rule: any, lead: any): Promise<string | null> {
    const adminClient = createAdminClient();
    const config = rule.action_config;

    switch (rule.action_type) {
      case 'assign_to_team_member':
        // Check if team member is available
        const { data: member } = await adminClient
          .from('team_members')
          .select('id, is_available, can_receive_leads, daily_lead_capacity')
          .eq('id', config.team_member_id)
          .single();

        if (member?.is_available && member?.can_receive_leads) {
          // Check daily capacity
          const { count } = await adminClient
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', config.team_member_id)
            .gte('assigned_at', new Date().toISOString().split('T')[0]);

          if ((count || 0) < member.daily_lead_capacity) {
            return config.team_member_id;
          }
        }
        return null;

      case 'round_robin':
        // Get next available from specified members
        const memberIds = config.team_member_ids || [];
        
        for (const memberId of memberIds) {
          const { data: tm } = await adminClient
            .from('team_members')
            .select('id, is_available, can_receive_leads')
            .eq('id', memberId)
            .single();

          if (tm?.is_available && tm?.can_receive_leads) {
            return tm.id;
          }
        }
        return null;

      case 'weighted':
        // Weighted random assignment
        const weights = config.weights || {};
        const totalWeight = Object.values(weights).reduce((sum: number, w: any) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (const [memberId, weight] of Object.entries(weights)) {
          random -= weight as number;
          if (random <= 0) {
            const { data: tm } = await adminClient
              .from('team_members')
              .select('id, is_available, can_receive_leads')
              .eq('id', memberId)
              .single();

            if (tm?.is_available && tm?.can_receive_leads) {
              return tm.id;
            }
          }
        }
        return null;

      case 'assign_to_pool':
        // Use the pool-based round-robin
        const { data: nextMember } = await adminClient.rpc('get_next_assignee', {
          pool: config.pool_name || 'default',
        });
        return nextMember;

      default:
        return null;
    }
  }

  // Send notification to team member about new lead
  private async sendAssignmentNotification(teamMember: any, lead: any): Promise<void> {
    const adminClient = createAdminClient();

    try {
      // In-app notification
      await adminClient.from('notifications').insert({
        user_id: teamMember.user_id,
        type: 'new_lead_assigned',
        title: '🎯 New Lead Assigned',
        message: `${lead.full_name} (${lead.phone}) - Source: ${lead.source}`,
        data: {
          lead_id: lead.id,
          lead_phone: lead.phone,
          lead_name: lead.full_name,
          source: lead.source,
        },
        priority: 'high',
        action_url: `/admin/crm/leads/${lead.id}`,
        action_type: 'open_lead',
        sound: 'notification',
      });

      // Could also send email, SMS, or push notification here
    } catch (error) {
      console.error('Send assignment notification error:', error);
    }
  }

  // Manually reassign lead
  async reassignLead(
    leadId: string,
    newTeamMemberId: string,
    reason?: string,
    assignedBy?: string
  ): Promise<AssignmentResult> {
    const adminClient = createAdminClient();

    try {
      // Get current lead
      const { data: lead } = await adminClient
        .from('leads')
        .select('*, assigned_to')
        .eq('id', leadId)
        .single();

      if (!lead) {
        return { success: false, error: 'Lead not found' };
      }

      const previousAssignee = lead.assigned_to;

      // Get new team member
      const { data: teamMember } = await adminClient
        .from('team_members')
        .select('*, user:users(*), whatsapp_account:whatsapp_accounts(*)')
        .eq('id', newTeamMemberId)
        .single();

      if (!teamMember) {
        return { success: false, error: 'Team member not found' };
      }

      // Update lead
      await adminClient
        .from('leads')
        .update({
          assigned_to: newTeamMemberId,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      // Log assignment history
      await adminClient.from('lead_assignments_history').insert({
        lead_id: leadId,
        from_team_member: previousAssignee,
        to_team_member: newTeamMemberId,
        reason,
        assigned_by: assignedBy,
      });

      // Log activity
      await adminClient.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'assignment',
        title: 'Lead reassigned',
        description: `Reassigned to ${teamMember.user?.full_name}${reason ? `. Reason: ${reason}` : ''}`,
        created_by: assignedBy,
      });

      // Update lead counts
      if (previousAssignee) {
        await adminClient
          .from('team_members')
          .update({ current_lead_count: adminClient.rpc('decrement', { x: 1 }) })
          .eq('id', previousAssignee);
      }

      await adminClient
        .from('team_members')
        .update({ current_lead_count: teamMember.current_lead_count + 1 })
        .eq('id', newTeamMemberId);

      // Send notification to new team member
      await this.sendAssignmentNotification(teamMember, lead);

      return {
        success: true,
        teamMemberId: newTeamMemberId,
        teamMember,
      };
    } catch (error) {
      console.error('Lead reassignment error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Get assignment statistics
  async getAssignmentStats(): Promise<any> {
    const adminClient = createAdminClient();

    const today = new Date().toISOString().split('T')[0];

    // Get team member stats
    const { data: teamStats } = await adminClient
      .from('team_members')
      .select(`
        id,
        daily_lead_capacity,
        current_lead_count,
        is_available,
        can_receive_leads,
        user:users(full_name)
      `)
      .eq('is_available', true);

    // Get today's assignments per member
    const { data: todayAssignments } = await adminClient
      .from('leads')
      .select('assigned_to')
      .gte('assigned_at', `${today}T00:00:00`)
      .lte('assigned_at', `${today}T23:59:59`);

    const assignmentCounts: Record<string, number> = {};
    todayAssignments?.forEach(lead => {
      if (lead.assigned_to) {
        assignmentCounts[lead.assigned_to] = (assignmentCounts[lead.assigned_to] || 0) + 1;
      }
    });

    // Get unassigned leads
    const { count: unassignedCount } = await adminClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .is('assigned_to', null)
      .eq('status', 'new');

    return {
      teamMembers: teamStats?.map(tm => ({
        ...tm,
        todayAssignments: assignmentCounts[tm.id] || 0,
        availableCapacity: tm.daily_lead_capacity - (assignmentCounts[tm.id] || 0),
      })),
      unassignedLeads: unassignedCount || 0,
      totalTodayAssignments: Object.values(assignmentCounts).reduce((sum, count) => sum + count, 0),
    };
  }
}

export const leadAssignmentService = new LeadAssignmentService();