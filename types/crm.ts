export type UserRole = 'agent' | 'manager' | 'superadmin';

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'negotiation' 
  | 'won' 
  | 'lost' 
  | 'follow_up';

export type LeadTemperature = 'hot' | 'warm' | 'cold';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'rto' 
  | 'cancelled';

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: LeadStatus;
  score: number;
  temperature: LeadTemperature;
  source?: string;
  campaign_name?: string;
  assigned_to?: string;
  assigned_agent_name?: string;
  ai_suggested_message?: string;
  ai_objection_handling?: string;
  ai_next_action?: string;
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
  tags?: string[];
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_at?: string;
  related_lead_id: string;
  assigned_to?: string;
  assigned_agent_name?: string;
  created_at: string;
  completed_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  awb_number?: string;
  courier_name?: string;
  current_status?: string;
  phone: string;
  lead_id?: string;
  is_rto: boolean;
  ndr_count: number;
  tracking_url?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface CallLog {
  id: string;
  lead_id: string;
  direction: 'inbound' | 'outbound';
  duration_seconds: number;
  status: 'completed' | 'missed' | 'no_answer' | 'busy';
  notes?: string;
  recording_url?: string;
  created_at: string;
  agent_name?: string;
}

export interface WhatsAppMessage {
  id: string;
  lead_id: string;
  direction: 'inbound' | 'outbound';
  message: string;
  template_name?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  lead_id: string;
  type: 'status_change' | 'task_created' | 'task_completed' | 'order_created' | 'order_updated' | 'call' | 'whatsapp' | 'note' | 'assignment';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  created_by?: string;
  agent_name?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

export interface LeadOverviewResponse {
  lead: Lead;
  tasks: Task[];
  orders: Order[];
  callLogs: CallLog[];
  whatsappMessages: WhatsAppMessage[];
  activities: ActivityEvent[];
  templates: WhatsAppTemplate[];
  userRole: UserRole;
  agents?: { id: string; name: string }[];
}
