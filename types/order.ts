// =====================================================
// Order Types and Interfaces
// =====================================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivery_attempt_1'
  | 'delivery_attempt_2'
  | 'delivery_attempt_3'
  | 'delivery_attempt_4'
  | 'delivery_attempt_5'
  | 'delivered'
  | 'rto_initiated'
  | 'rto_in_transit'
  | 'rto_received'
  | 'cancelled'
  | 'refunded';

export type DeliveryAttemptResult =
  | 'customer_unavailable'
  | 'wrong_address'
  | 'customer_refused'
  | 'incomplete_address'
  | 'customer_requested_reschedule'
  | 'payment_not_ready'
  | 'premises_closed'
  | 'other';

export type UpdateSource = 'manual' | 'api' | 'webhook' | 'automation';
export type UserRole = 'admin' | 'agent' | 'super_admin' | 'system' | 'courier';
export type NotificationType = 'sms' | 'email' | 'whatsapp' | 'push';

// Order interface
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Address
  shipping_address: Address;
  billing_address?: Address;
  
  // Order details
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  
  // Status
  current_status: OrderStatus;
  status_updated_at: string;
  delivery_attempts_count: number;
  max_delivery_attempts: number;
  is_rto: boolean;
  rto_initiated_at?: string;
  delivered_at?: string;
  
  // Shipping
  tracking_number?: string;
  courier_partner?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant?: string;
}

// Status History
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  notes?: string;
  internal_notes?: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_by_role?: UserRole;
  source: UpdateSource;
  ip_address?: string;
  created_at: string;
}

// Delivery Attempt
export interface DeliveryAttempt {
  id: string;
  order_id: string;
  status_history_id?: string;
  attempt_number: number;
  attempt_date: string;
  attempt_time?: string;
  result: DeliveryAttemptResult;
  result_description?: string;
  delivery_person_name?: string;
  delivery_person_phone?: string;
  customer_response?: string;
  reschedule_requested: boolean;
  rescheduled_date?: string;
  photo_url?: string;
  signature_url?: string;
  geo_location?: { lat: number; lng: number };
  notes?: string;
  internal_notes?: string;
  recorded_by?: string;
  recorded_by_name?: string;
  created_at: string;
  updated_at: string;
}

// RTO Details
export interface RTODetails {
  id: string;
  order_id: string;
  reason: string;
  reason_category?: string;
  rto_tracking_number?: string;
  rto_courier_partner?: string;
  initiated_at: string;
  in_transit_at?: string;
  received_at?: string;
  return_condition?: 'good' | 'damaged' | 'opened' | 'missing_items';
  condition_notes?: string;
  refund_initiated: boolean;
  refund_amount?: number;
  refund_date?: string;
  initiated_by?: string;
  initiated_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Order Notification
export interface OrderNotification {
  id: string;
  order_id: string;
  status_history_id?: string;
  notification_type: NotificationType;
  template_id?: string;
  recipient_phone?: string;
  recipient_email?: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  provider?: string;
  provider_message_id?: string;
  created_at: string;
}

// Full Order with History
export interface OrderWithHistory {
  order: Order;
  status_history: OrderStatusHistory[];
  delivery_attempts: DeliveryAttempt[];
  rto_details?: RTODetails;
}