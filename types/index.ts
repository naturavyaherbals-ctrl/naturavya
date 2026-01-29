// =====================================================
// NATURAVYA AI SALES OS - TYPE DEFINITIONS (SOURCE OF TRUTH FOR UI)
// =====================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent';

/**
 * IMPORTANT: This union must match real values in `public.leads.status`.
 * From your DB query, we confirmed at least: 'new', 'contacted'
 */
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'not_picked'
  | 'callback'
  | 'follow_up'
  | 'interested'
  | 'hot_lead'
  | 'order_confirmed'
  | 'cancelled'
  | 'not_interested'
  | 'wrong_number'
  | 'dnd';

export type LeadSource =
  | 'meta_ads'
  | 'google_ads'
  | 'website'
  | 'referral'
  | 'manual'
  | 'whatsapp';

export type LeadTemperature = 'hot' | 'warm' | 'cold';

/**
 * Orders in DB currently have mostly NULL + 'pending_verification'.
 * Keep this union as UI-facing; we’ll normalize later via DB view.
 */
export type OrderStatus =
  | 'pending_verification'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'rto'
  | 'ndr'
  | string;

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole | 'agent';
  department?: string | null;

  daily_lead_capacity: number;
  current_daily_leads: number;
  max_active_leads: number;
  current_active_leads: number;

  total_leads_assigned: number;
  total_leads_converted: number;

  last_lead_assigned_at?: string | null;

  is_active: boolean;
  is_available: boolean;

  created_at?: string;
  updated_at?: string;
}

export type LeadActivityType =
  | 'note'
  | 'call'
  | 'whatsapp'
  | 'email'
  | 'status_change'
  | 'assignment'
  | 'follow_up_scheduled'
  | 'order_created';

export interface LeadActivity {
  id: string;
  lead_id: string;

  activity_type: LeadActivityType;

  description?: string | null;
  notes?: string | null;
  outcome?: string | null;

  scheduled_at?: string | null;
  completed_at?: string | null;

  created_by?: string | null;
  created_at: string;

  /**
   * Returned by `lead_activities_v` view
   * { full_name: team_members.name }
   */
  created_by_user?: { full_name: string } | null;
}

export interface LeadStatusHistory {
  id: string;
  lead_id: string;

  old_status?: string | null;
  new_status: LeadStatus;

  notes?: string | null;

  created_by?: string | null;
  created_at: string;

  /**
   * Returned by `lead_status_history_v` view
   * { full_name: team_members.name }
   */
  created_by_user?: { full_name: string } | null;
}

export interface Lead {
  id: string;

  full_name?: string | null;
  phone: string;
  email?: string | null;
  alternate_phone?: string | null;

  city?: string | null;
  state?: string | null;

  postal_code?: string | null;
  pincode?: string | null;

  address?: string | null;

  status: LeadStatus;
  source: string;

  // Meta/UTM attribution (DB truth)
  campaign_name?: string | null;
  ad_id?: string | null;
  adset_id?: string | null;
  form_id?: string | null;
  form_name?: string | null;
  source_campaign?: string | null;

  // Interest
  interested_products?: any; // jsonb in DB (array)
  interested_categories?: string[] | null;

  budget_range?: string | null;

  // Assignment
  assigned_to?: string | null; // team_members.id
  assigned_at?: string | null;
  assigned_team_member?: TeamMember | null; // when joined in select

  // Follow-up + engagement
  next_follow_up_at?: string | null;
  next_follow_up?: string | null; // legacy column exists
  follow_up_count?: number | null;

  last_contacted_at?: string | null;
  last_activity_at?: string | null;

  response_time_minutes?: number | null;
  engagement_score?: number | null;
  website_visits?: number | null;
  whatsapp_responses?: number | null;

  call_attempts?: number | null;
  last_call_at?: string | null;

  // Conversion
  is_converted?: boolean | null;
  converted_order_id?: string | null;
  converted_at?: string | null;

  // AI
  temperature?: LeadTemperature | string | null;
  score?: number | null;
  ai_insights?: any; // jsonb in DB (array)
  ai_suggested_message?: string | null;
  ai_suggested_action?: string | null;

  // Ops/meta
  raw_data?: any; // jsonb in DB
  notes?: string | null;
  tags?: string[] | null;

  // Priority (DB truth: integer)
  priority?: number | null;

  created_at: string;
  updated_at: string;

  // Enriched payload for LeadDetailModal GET
  activities?: LeadActivity[];
  status_history?: LeadStatusHistory[];
  orders?: Order[];
}

export interface AIInsight {
  type: 'behavior' | 'timing' | 'product' | 'sentiment';
  message: string;
  confidence: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number?: string | null;

  created_at: string;

  // DB has both total_amount + total
  total_amount?: number | null;
  total?: number | null;

  status?: OrderStatus | null;

  payment_method?: string | null;
  payment_status?: string | null;

  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;

  phone?: string | null;
  shipping_phone?: string | null;

  items?: any; // jsonb
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'meta' | 'google';
  adset_name?: string;
  ad_name?: string;
  spend: number;
  leads_count: number;
  conversions: number;
  revenue: number;
  roi: number;
  cpl: number;
  cpa: number;
}

export interface StaffPerformance {
  team_member_id: string;
  name: string;
  avatar_url?: string;
  leads_assigned: number;
  leads_contacted: number;
  leads_converted: number;
  revenue: number;
  conversion_rate: number;
  avg_response_time: number;
  pending_follow_ups: number;
  hot_leads: number;
  rank: number;
}

export interface LeakagePoint {
  stage: string;
  from_count: number;
  to_count: number;
  drop_rate: number;
  potential_revenue_loss: number;
  suggestion: string;
}

export interface DashboardStats {
  leads_today: number;
  leads_total: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  orders_today: number;
  revenue_today: number;
  conversion_rate: number;
  avg_response_time: number;
  pending_follow_ups: number;
  overdue_follow_ups: number;
}

// Hinglish AI Message Templates
export interface HinglishTemplate {
  id: string;
  name: string;
  trigger: string;
  temperature: LeadTemperature;
  message: string;
  follow_up_delay_hours: number;
}

// =====================================================
// LEAD WORKFLOW CONFIG (USED BY KANBAN + STATUS BUTTONS)
// =====================================================

export type LeadStatusConfig = {
  label: string;
  color: string;
  bgColor: string;
  nextSteps: LeadStatus[];
  isFinal?: boolean;
  requiresNote?: boolean;
};

export const LEAD_STATUS_CONFIG: Record<LeadStatus, LeadStatusConfig> = {
  new: {
    label: 'New',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    nextSteps: [
      'contacted',
      'not_picked',
      'callback',
      'follow_up',
      'interested',
      'hot_lead',
      'order_confirmed',
      'not_interested',
      'wrong_number',
      'dnd',
    ],
  },

  contacted: {
    label: 'Called/Contacted',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    nextSteps: [
      'follow_up',
      'interested',
      'hot_lead',
      'order_confirmed',
      'not_interested',
      'wrong_number',
      'dnd',
    ],
  },

  not_picked: {
    label: 'Not Picked',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    nextSteps: [
      'contacted',
      'callback',
      'follow_up',
      'interested',
      'hot_lead',
      'order_confirmed',
      'not_interested',
      'wrong_number',
      'dnd',
    ],
  },

  callback: {
    label: 'Callback',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    nextSteps: [
      'contacted',
      'follow_up',
      'interested',
      'hot_lead',
      'order_confirmed',
      'not_interested',
      'wrong_number',
      'dnd',
    ],
  },

  follow_up: {
    label: 'Follow Up',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    nextSteps: [
      'contacted',
      'callback',
      'interested',
      'hot_lead',
      'order_confirmed',
      'not_interested',
      'wrong_number',
      'dnd',
    ],
  },

  interested: {
    label: 'Interested',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    nextSteps: [
      'contacted',
      'follow_up',
      'hot_lead',
      'order_confirmed',
      'not_interested',
      'wrong_number',
      'dnd',
    ],
  },

  hot_lead: {
    label: 'Hot Lead',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    nextSteps: [
      'contacted',
      'follow_up',
      'order_confirmed',
      'not_interested',
      'wrong_number',
      'dnd',
    ],
  },

  order_confirmed: {
    label: 'Order Confirmed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    nextSteps: ['cancelled'],
  },

  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    nextSteps: [],
    isFinal: true,
    requiresNote: true,
  },

  not_interested: {
    label: 'Not Interested',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    nextSteps: [],
    isFinal: true,
    requiresNote: true,
  },

  wrong_number: {
    label: 'Wrong Number',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    nextSteps: [],
    isFinal: true,
    requiresNote: true,
  },

  dnd: {
    label: 'DND',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    nextSteps: [],
    isFinal: true,
    requiresNote: true,
  },
};
