// =====================================================
// ENTERPRISE CRM TYPE DEFINITIONS
// =====================================================

// =====================================================
// USER ROLES & PERMISSIONS
// =====================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'customer';

export interface Permission {
  // Dashboard
  view_dashboard: boolean;
  view_all_stats: boolean;
  view_team_stats: boolean;
  view_own_stats: boolean;

  // Leads
  view_all_leads: boolean;
  view_team_leads: boolean;
  view_assigned_leads: boolean;
  create_lead: boolean;
  edit_lead: boolean;
  delete_lead: boolean;
  assign_lead: boolean;
  reassign_lead: boolean;
  export_leads: boolean;
  import_leads: boolean;

  // Orders
  view_all_orders: boolean;
  view_team_orders: boolean;
  view_assigned_orders: boolean;
  create_order: boolean;
  edit_order: boolean;
  cancel_order: boolean;
  refund_order: boolean;

  // Products
  view_products: boolean;
  create_product: boolean;
  edit_product: boolean;
  delete_product: boolean;
  manage_inventory: boolean;

  // Customers
  view_all_customers: boolean;
  view_assigned_customers: boolean;
  edit_customer: boolean;

  // Team
  view_team: boolean;
  manage_team: boolean;
  view_team_performance: boolean;
  assign_targets: boolean;

  // Reports
  view_reports: boolean;
  export_reports: boolean;

  // Settings
  view_settings: boolean;
  edit_settings: boolean;
  manage_users: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  super_admin: {
    view_dashboard: true,
    view_all_stats: true,
    view_team_stats: true,
    view_own_stats: true,
    view_all_leads: true,
    view_team_leads: true,
    view_assigned_leads: true,
    create_lead: true,
    edit_lead: true,
    delete_lead: true,
    assign_lead: true,
    reassign_lead: true,
    export_leads: true,
    import_leads: true,
    view_all_orders: true,
    view_team_orders: true,
    view_assigned_orders: true,
    create_order: true,
    edit_order: true,
    cancel_order: true,
    refund_order: true,
    view_products: true,
    create_product: true,
    edit_product: true,
    delete_product: true,
    manage_inventory: true,
    view_all_customers: true,
    view_assigned_customers: true,
    edit_customer: true,
    view_team: true,
    manage_team: true,
    view_team_performance: true,
    assign_targets: true,
    view_reports: true,
    export_reports: true,
    view_settings: true,
    edit_settings: true,
    manage_users: true,
  },
  admin: {
    view_dashboard: true,
    view_all_stats: true,
    view_team_stats: true,
    view_own_stats: true,
    view_all_leads: true,
    view_team_leads: true,
    view_assigned_leads: true,
    create_lead: true,
    edit_lead: true,
    delete_lead: false,
    assign_lead: true,
    reassign_lead: true,
    export_leads: true,
    import_leads: true,
    view_all_orders: true,
    view_team_orders: true,
    view_assigned_orders: true,
    create_order: true,
    edit_order: true,
    cancel_order: true,
    refund_order: false,
    view_products: true,
    create_product: true,
    edit_product: true,
    delete_product: false,
    manage_inventory: true,
    view_all_customers: true,
    view_assigned_customers: true,
    edit_customer: true,
    view_team: true,
    manage_team: true,
    view_team_performance: true,
    assign_targets: true,
    view_reports: true,
    export_reports: true,
    view_settings: true,
    edit_settings: false,
    manage_users: false,
  },
  manager: {
    view_dashboard: true,
    view_all_stats: false,
    view_team_stats: true,
    view_own_stats: true,
    view_all_leads: false,
    view_team_leads: true,
    view_assigned_leads: true,
    create_lead: true,
    edit_lead: true,
    delete_lead: false,
    assign_lead: true,
    reassign_lead: true,
    export_leads: true,
    import_leads: false,
    view_all_orders: false,
    view_team_orders: true,
    view_assigned_orders: true,
    create_order: true,
    edit_order: true,
    cancel_order: false,
    refund_order: false,
    view_products: true,
    create_product: false,
    edit_product: false,
    delete_product: false,
    manage_inventory: false,
    view_all_customers: false,
    view_assigned_customers: true,
    edit_customer: true,
    view_team: true,
    manage_team: false,
    view_team_performance: true,
    assign_targets: false,
    view_reports: true,
    export_reports: false,
    view_settings: false,
    edit_settings: false,
    manage_users: false,
  },
  agent: {
    view_dashboard: true,
    view_all_stats: false,
    view_team_stats: false,
    view_own_stats: true,
    view_all_leads: false,
    view_team_leads: false,
    view_assigned_leads: true,
    create_lead: true,
    edit_lead: true,
    delete_lead: false,
    assign_lead: false,
    reassign_lead: false,
    export_leads: false,
    import_leads: false,
    view_all_orders: false,
    view_team_orders: false,
    view_assigned_orders: true,
    create_order: true,
    edit_order: false,
    cancel_order: false,
    refund_order: false,
    view_products: true,
    create_product: false,
    edit_product: false,
    delete_product: false,
    manage_inventory: false,
    view_all_customers: false,
    view_assigned_customers: true,
    edit_customer: false,
    view_team: false,
    manage_team: false,
    view_team_performance: false,
    assign_targets: false,
    view_reports: false,
    export_reports: false,
    view_settings: false,
    edit_settings: false,
    manage_users: false,
  },
  customer: {
    view_dashboard: false,
    view_all_stats: false,
    view_team_stats: false,
    view_own_stats: false,
    view_all_leads: false,
    view_team_leads: false,
    view_assigned_leads: false,
    create_lead: false,
    edit_lead: false,
    delete_lead: false,
    assign_lead: false,
    reassign_lead: false,
    export_leads: false,
    import_leads: false,
    view_all_orders: false,
    view_team_orders: false,
    view_assigned_orders: false,
    create_order: false,
    edit_order: false,
    cancel_order: false,
    refund_order: false,
    view_products: false,
    create_product: false,
    edit_product: false,
    delete_product: false,
    manage_inventory: false,
    view_all_customers: false,
    view_assigned_customers: false,
    edit_customer: false,
    view_team: false,
    manage_team: false,
    view_team_performance: false,
    assign_targets: false,
    view_reports: false,
    export_reports: false,
    view_settings: false,
    edit_settings: false,
    manage_users: false,
  },
};

// =====================================================
// USER & TEAM
// =====================================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  user?: User;
  employee_id?: string;
  department?: string;
  designation?: string;
  reporting_to?: string;
  manager?: TeamMember;
  team_members?: TeamMember[]; // For managers - their team
  permissions?: Partial<Permission>;
  daily_lead_limit: number;
  monthly_target: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Computed stats
  stats?: TeamMemberStats;
}

export interface TeamMemberStats {
  leads_assigned_today: number;
  leads_assigned_total: number;
  leads_converted_today: number;
  leads_converted_total: number;
  orders_today: number;
  orders_total: number;
  revenue_today: number;
  revenue_total: number;
  conversion_rate: number;
  avg_response_time: number; // in minutes
  follow_up_pending: number;
}

// =====================================================
// LEAD STATUS & SOURCE
// =====================================================

export type LeadStatus =
  | 'new'
  | 'not_picked'
  | 'callback_requested'
  | 'follow_up'
  | 'interested'
  | 'hot_lead'
  | 'order_confirmed'
  | 'payment_pending'
  | 'cancelled'
  | 'not_interested'
  | 'wrong_number'
  | 'duplicate'
  | 'dnd'
  | 'converted';

export type LeadSource =
  | 'meta_ads'
  | 'google_ads'
  | 'organic'
  | 'referral'
  | 'direct'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'website'
  | 'manual'
  | 'import';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export const LEAD_STATUS_CONFIG: Record<LeadStatus, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  nextSteps: LeadStatus[];
}> = {
  new: {
    label: 'New',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Fresh lead, needs first contact',
    nextSteps: ['not_picked', 'follow_up', 'interested', 'not_interested', 'wrong_number'],
  },
  not_picked: {
    label: 'Not Picked',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Call not answered',
    nextSteps: ['callback_requested', 'follow_up', 'wrong_number', 'dnd'],
  },
  callback_requested: {
    label: 'Callback Requested',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Customer requested callback at specific time',
    nextSteps: ['follow_up', 'interested', 'not_interested'],
  },
  follow_up: {
    label: 'Follow Up',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Needs follow-up call',
    nextSteps: ['interested', 'hot_lead', 'not_interested', 'cancelled'],
  },
  interested: {
    label: 'Interested',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Showed interest in product',
    nextSteps: ['hot_lead', 'order_confirmed', 'follow_up', 'not_interested'],
  },
  hot_lead: {
    label: 'Hot Lead',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Ready to purchase, priority follow-up',
    nextSteps: ['order_confirmed', 'payment_pending', 'follow_up'],
  },
  order_confirmed: {
    label: 'Order Confirmed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Order has been confirmed',
    nextSteps: ['converted', 'cancelled'],
  },
  payment_pending: {
    label: 'Payment Pending',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    description: 'Waiting for payment',
    nextSteps: ['order_confirmed', 'cancelled'],
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Lead cancelled or order cancelled',
    nextSteps: ['follow_up'],
  },
  not_interested: {
    label: 'Not Interested',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Not interested at this time',
    nextSteps: ['follow_up'],
  },
  wrong_number: {
    label: 'Wrong Number',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Invalid phone number',
    nextSteps: [],
  },
  duplicate: {
    label: 'Duplicate',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Duplicate lead entry',
    nextSteps: [],
  },
  dnd: {
    label: 'DND',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Do Not Disturb - Customer requested no calls',
    nextSteps: [],
  },
  converted: {
    label: 'Converted',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Successfully converted to customer',
    nextSteps: [],
  },
};

// =====================================================
// LEAD
// =====================================================

export interface Lead {
  id: string;
  
  // Contact Info
  full_name?: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  whatsapp_number?: string;
  
  // Location
  city?: string;
  state?: string;
  postal_code?: string;
  address?: string;
  
  // Lead Info
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  
  // Campaign Info
  campaign_id?: string;
  campaign_name?: string;
  ad_id?: string;
  adset_id?: string;
  form_id?: string;
  form_name?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // Product Interest
  interested_products?: ProductInterest[];
  budget_range?: string;
  
  // Assignment
  assigned_to?: string;
  assigned_team_member?: TeamMember;
  assigned_at?: string;
  previous_assignees?: string[];
  
  // Follow-up
  next_follow_up_at?: string;
  follow_up_count: number;
  last_contacted_at?: string;
  last_contact_outcome?: string;
  
  // Call Tracking
  call_count: number;
  total_call_duration: number; // in seconds
  
  // Conversion
  is_converted: boolean;
  converted_order_id?: string;
  converted_at?: string;
  order_value?: number;
  
  // Meta
  raw_data?: Record<string, unknown>;
  notes?: string;
  tags?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  activities?: LeadActivity[];
  status_history?: LeadStatusHistory[];
  orders?: Order[];
}

export interface ProductInterest {
  product_id: string;
  product_name: string;
  quantity?: number;
  variant?: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: 'call' | 'whatsapp' | 'sms' | 'email' | 'note' | 'status_change' | 'assignment' | 'follow_up_scheduled' | 'order_created';
  description?: string;
  outcome?: string;
  duration?: number; // for calls, in seconds
  notes?: string;
  scheduled_at?: string;
  completed_at?: string;
  created_by?: string;
  created_by_user?: User;
  created_at: string;
}

export interface LeadStatusHistory {
  id: string;
  lead_id: string;
  old_status?: LeadStatus;
  new_status: LeadStatus;
  notes?: string;
  created_by?: string;
  created_by_user?: User;
  created_at: string;
}

// =====================================================
// ORDER
// =====================================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cod_pending'
  | 'cod_collected';

export type PaymentMethod =
  | 'cod'
  | 'razorpay'
  | 'phonepe'
  | 'paytm'
  | 'upi'
  | 'card'
  | 'netbanking';

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  lead_id?: string;
  
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  
  coupon_code?: string;
  
  // Shipping
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_phone?: string;
  shipping_email?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_landmark?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  
  // Tracking
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  
  // Assignment
  assigned_to?: string;
  assigned_team_member?: TeamMember;
  
  // Notes
  customer_notes?: string;
  internal_notes?: string;
  
  // Source
  source?: string;
  
  // Timestamps
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  items?: OrderItem[];
  lead?: Lead;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  sku?: string;
  name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  image_url?: string;
}

// =====================================================
// DASHBOARD & REPORTS
// =====================================================

export interface DashboardStats {
  // Today
  leads_today: number;
  leads_new_today: number;
  orders_today: number;
  revenue_today: number;
  calls_today: number;
  conversions_today: number;
  
  // Total
  leads_total: number;
  orders_total: number;
  revenue_total: number;
  customers_total: number;
  
  // Pending Actions
  pending_follow_ups: number;
  pending_orders: number;
  hot_leads: number;
  
  // Performance
  conversion_rate: number;
  avg_order_value: number;
  
  // Team (for managers/admins)
  team_size?: number;
  team_leads_today?: number;
  team_conversions_today?: number;
}

export interface LeadReport {
  date: string;
  new_leads: number;
  contacted: number;
  interested: number;
  converted: number;
  not_interested: number;
  pending: number;
}

export interface TeamPerformanceReport {
  team_member_id: string;
  name: string;
  avatar_url?: string;
  leads_assigned: number;
  leads_contacted: number;
  leads_converted: number;
  orders: number;
  revenue: number;
  conversion_rate: number;
  avg_response_time: number;
  target_achievement: number;
}