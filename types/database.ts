// =====================================================
// AUTO-GENERATED DATABASE TYPES FOR SUPABASE
// =====================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'customer';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cod_pending' | 'cod_collected';
export type PaymentMethod = 'cod' | 'online' | 'upi' | 'card' | 'netbanking' | 'wallet';
export type LeadStatus = 'new' | 'not_picked' | 'follow_up' | 'interested' | 'order_confirmed' | 'cancelled' | 'wrong_number' | 'not_interested' | 'callback';
export type LeadSource = 'meta_ads' | 'google_ads' | 'website' | 'referral' | 'manual' | 'whatsapp' | 'phone';
export type ActivityType = 'call' | 'whatsapp' | 'email' | 'note' | 'status_change' | 'assignment' | 'order_created';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  password_hash: string | null;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  employee_id: string | null;
  department: string | null;
  designation: string | null;
  reporting_to: string | null;
  daily_lead_capacity: number;
  is_available: boolean;
  shift_start: string | null;
  shift_end: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  category_id: string | null;
  brand: string | null;
  weight: number | null;
  weight_unit: string;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  requires_shipping: boolean;
  tax_rate: number;
  hsn_code: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  inventory?: Inventory;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  weight: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  inventory?: Inventory;
}

export interface Inventory {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  warehouse_location: string | null;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  coupon_code: string | null;
  discount_amount: number;
  notes: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_add: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  lead_id: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  billing_same_as_shipping: boolean;
  billing_name: string | null;
  billing_phone: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_pincode: string | null;
  billing_country: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  courier_name: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  source: string;
  notes: string | null;
  admin_notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: User;
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  alternate_phone: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  address: string | null;
  source: LeadSource;
  source_campaign: string | null;
  source_adset: string | null;
  source_ad: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string | null;
  interested_products: string[] | null;
  interested_categories: string[] | null;
  budget_range: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  status: LeadStatus;
  priority: number;
  call_attempts: number;
  last_call_at: string | null;
  next_follow_up: string | null;
  converted_at: string | null;
  order_id: string | null;
  meta_lead_id: string | null;
  raw_data: Record<string, any> | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_team_member?: TeamMember;
  activities?: LeadActivity[];
  order?: Order;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  outcome: string | null;
  duration_seconds: number | null;
  scheduled_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  created_by_user?: User;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  applicable_products: string[] | null;
  applicable_categories: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface DailyAnalytics {
  id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  total_leads: number;
  leads_converted: number;
  cart_abandonment_rate: number | null;
  average_order_value: number | null;
  top_products: Record<string, any> | null;
  traffic_sources: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface TeamPerformance {
  id: string;
  team_member_id: string;
  date: string;
  leads_assigned: number;
  leads_contacted: number;
  leads_converted: number;
  calls_made: number;
  total_talk_time: number;
  orders_value: number;
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      user_addresses: {
        Row: UserAddress;
        Insert: Omit<UserAddress, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserAddress, 'id' | 'created_at'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamMember, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>;
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProductVariant, 'id' | 'created_at'>>;
      };
      inventory: {
        Row: Inventory;
        Insert: Omit<Inventory, 'id' | 'updated_at'>;
        Update: Partial<Omit<Inventory, 'id'>>;
      };
      carts: {
        Row: Cart;
        Insert: Omit<Cart, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Cart, 'id' | 'created_at'>>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CartItem, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
      order_status_history: {
        Row: OrderStatusHistory;
        Insert: Omit<OrderStatusHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderStatusHistory, 'id' | 'created_at'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      lead_activities: {
        Row: LeadActivity;
        Insert: Omit<LeadActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<LeadActivity, 'id' | 'created_at'>>;
      };
      coupons: {
        Row: Coupon;
        Insert: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Coupon, 'id' | 'created_at'>>;
      };
      settings: {
        Row: Setting;
        Insert: Omit<Setting, 'id' | 'updated_at'>;
        Update: Partial<Omit<Setting, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
  };
}