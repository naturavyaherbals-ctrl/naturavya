// =====================================================
// EXTENDED TYPE DEFINITIONS
// =====================================================

import { User, Lead, Order, Product, TeamMember } from './database';

// Reviews & Testimonials
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'featured';
export type ReviewSource = 'website' | 'manual' | 'import' | 'google' | 'facebook';

export interface Review {
  id: string;
  product_id: string | null;
  user_id: string | null;
  order_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_avatar_url: string | null;
  customer_location: string | null;
  rating: number;
  title: string | null;
  content: string;
  images: string[] | null;
  video_url: string | null;
  status: ReviewStatus;
  is_verified_purchase: boolean;
  is_featured: boolean;
  source: ReviewSource;
  approved_by: string | null;
  approved_at: string | null;
  admin_notes: string | null;
  display_order: number;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export type TestimonialStatus = 'draft' | 'published' | 'archived';

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_title: string | null;
  customer_company: string | null;
  customer_location: string | null;
  customer_avatar_url: string | null;
  content: string;
  short_quote: string | null;
  rating: number | null;
  image_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  category: string | null;
  tags: string[] | null;
  status: TestimonialStatus;
  is_featured: boolean;
  show_on_homepage: boolean;
  display_order: number;
  display_pages: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Pages & Media
export interface Page {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_image_url: string | null;
  canonical_url: string | null;
  content: Record<string, any> | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  images?: PageImage[];
}

export interface PageImage {
  id: string;
  page_id: string;
  name: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  section: string | null;
  position: string | null;
  display_order: number;
  is_active: boolean;
  mobile_image_url: string | null;
  tablet_image_url: string | null;
  alt_text: string | null;
  title_text: string | null;
  link_url: string | null;
  link_target: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_filename: string | null;
  file_type: string;
  file_size: number | null;
  mime_type: string | null;
  url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  title: string | null;
  description: string | null;
  folder: string;
  tags: string[] | null;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
}

// SEO
export interface SEOSettings {
  id: string;
  page_type: string;
  page_identifier: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  og_type: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_url: string | null;
  twitter_card: string;
  canonical_url: string | null;
  robots: string;
  structured_data: Record<string, any> | null;
  custom_head_tags: string | null;
  custom_scripts: string | null;
  created_at: string;
  updated_at: string;
}

// Ad Analytics
export interface AdAccount {
  id: string;
  platform: 'meta' | 'google' | 'other';
  account_id: string;
  account_name: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at: string | null;
  config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  ad_account_id: string;
  platform_campaign_id: string;
  platform: string;
  name: string;
  status: string | null;
  objective: string | null;
  daily_budget: number | null;
  lifetime_budget: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversion_value: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  roas: number | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
  adsets?: AdAdset[];
}

export interface AdAdset {
  id: string;
  campaign_id: string;
  platform_adset_id: string;
  name: string;
  status: string | null;
  targeting: Record<string, any> | null;
  daily_budget: number | null;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdDailyMetrics {
  id: string;
  ad_account_id: string | null;
  campaign_id: string | null;
  adset_id: string | null;
  date: string;
  platform: string;
  impressions: number;
  reach: number;
  clicks: number;
  unique_clicks: number;
  spend: number;
  leads: number;
  purchases: number;
  add_to_carts: number;
  checkouts_initiated: number;
  purchase_value: number;
  likes: number;
  comments: number;
  shares: number;
  video_views: number;
  created_at: string;
}

// CRM Extended
export interface LeadTag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface CallLog {
  id: string;
  lead_id: string;
  team_member_id: string | null;
  call_type: 'outbound' | 'inbound' | 'missed' | 'voicemail';
  phone_number: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  ring_time_seconds: number | null;
  disposition: string | null;
  outcome: string | null;
  recording_url: string | null;
  recording_duration: number | null;
  notes: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  created_at: string;
  team_member?: TeamMember;
}

export interface Task {
  id: string;
  assigned_to: string | null;
  created_by: string | null;
  lead_id: string | null;
  order_id: string | null;
  title: string;
  description: string | null;
  task_type: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  reminder_at: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: User;
  lead?: Lead;
  order?: Order;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: string[] | null;
  category: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  orders: {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  leads: {
    totalLeads: number;
    newLeads: number;
    followUpLeads: number;
    convertedLeads: number;
    conversionRate: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  ads: {
    totalSpend: number;
    totalLeads: number;
    costPerLead: number;
    roas: number;
  };
}

export interface TeamMemberWithStats extends TeamMember {
  user: User;
  stats?: {
    leadsAssigned: number;
    leadsContacted: number;
    leadsConverted: number;
    conversionRate: number;
    totalCalls: number;
    avgCallDuration: number;
    totalRevenue: number;
  };
}