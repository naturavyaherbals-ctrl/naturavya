'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Leaf,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Lead,
  Task,
  Order,
  CallLog,
  WhatsAppMessage,
  ActivityEvent,
  WhatsAppTemplate,
  UserRole,
  LeadOverviewResponse,
} from '@/types/crm';
import { LeadHeader } from '@/components/crm/LeadHeader';
import { LeadInfoPanel } from '@/components/crm/LeadInfoPanel';
import { TasksPanel } from '@/components/crm/TasksPanel';
import { OrdersPanel } from '@/components/crm/OrdersPanel';
import { CommunicationPanel } from '@/components/crm/CommunicationPanel';
import { AIAssistantPanel } from '@/components/crm/AIAssistantPanel';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { EditLeadModal } from '@/components/crm/EditLeadModal';

// Simulated lead ID (in Next.js this would come from useParams)
const DEMO_LEAD_ID = 'lead-001';

// Mock data for demonstration
const mockLeadData: LeadOverviewResponse = {
  lead: {
    id: 'lead-001',
    full_name: 'Rajesh Kumar Sharma',
    phone: '9876543210',
    alternate_phone: '9876543211',
    email: 'rajesh.sharma@email.com',
    address: '123, Lajpat Nagar, Block B',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110024',
    status: 'qualified',
    score: 75,
    temperature: 'hot',
    source: 'Facebook Ads',
    campaign_name: 'Summer Wellness 2024',
    assigned_to: 'agent-001',
    assigned_agent_name: 'Priya Singh',
    ai_suggested_message: `Namaste Rajesh ji! 🙏

I'm calling from Naturavya Herbals regarding the Ashwagandha supplements you showed interest in.

Based on your interest in stress relief and better sleep, I'd like to recommend our Premium Ashwagandha Gold formula - it's our best seller with 98% customer satisfaction.

Special offer just for you:
✅ Buy 2, Get 1 FREE
✅ Free shipping across India
✅ 30-day money-back guarantee

Would you like me to help you place an order today?`,
    ai_objection_handling: `**Common Objections & Responses:**

1. "It's too expensive"
→ "I understand, Rajesh ji. Let me share that our Ashwagandha Gold uses KSM-66, the most clinically studied extract. Plus, with our Buy 2 Get 1 offer, you're getting 3 months' supply at the price of 2!"

2. "I'll think about it"
→ "Of course! Just so you know, this offer expires tonight. I can reserve your order for the next 2 hours if you need time to decide."

3. "Does it really work?"
→ "Great question! We have 15,000+ verified reviews with 4.8 star rating. I can send you some customer testimonials on WhatsApp right now."`,
    ai_next_action: `**Recommended Next Steps:**

1. ⏰ Schedule follow-up call tomorrow at 11 AM
2. 📱 Send product brochure via WhatsApp
3. 🎁 Offer limited-time discount code: SUMMER20
4. 📦 If interested, create COD order with 48hr delivery`,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    last_contacted_at: '2024-01-20T14:45:00Z',
    tags: ['High Value', 'Repeat Buyer', 'Health Conscious'],
    notes: 'Interested in Ayurvedic supplements for stress and sleep. Previous customer - bought Triphala in 2023.',
  },
  tasks: [
    {
      id: 'task-001',
      title: 'Follow-up call - Discuss Ashwagandha offer',
      description: 'Customer requested callback after 5 PM',
      status: 'pending',
      priority: 'high',
      due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      related_lead_id: 'lead-001',
      assigned_to: 'agent-001',
      assigned_agent_name: 'Priya Singh',
      created_at: '2024-01-20T10:00:00Z',
    },
    {
      id: 'task-002',
      title: 'Send WhatsApp catalog',
      description: 'Share new product catalog and pricing',
      status: 'pending',
      priority: 'medium',
      due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      related_lead_id: 'lead-001',
      assigned_to: 'agent-001',
      assigned_agent_name: 'Priya Singh',
      created_at: '2024-01-19T15:30:00Z',
    },
    {
      id: 'task-003',
      title: 'Verify delivery address',
      description: 'Confirm pincode serviceability',
      status: 'completed',
      priority: 'low',
      due_at: '2024-01-18T12:00:00Z',
      related_lead_id: 'lead-001',
      assigned_to: 'agent-001',
      assigned_agent_name: 'Priya Singh',
      created_at: '2024-01-17T09:00:00Z',
      completed_at: '2024-01-18T11:30:00Z',
    },
  ],
  orders: [
    {
      id: 'order-001',
      order_number: 'NVH-2024-0156',
      status: 'shipped',
      total_amount: 1499,
      awb_number: 'SF123456789',
      courier_name: 'Shiprocket',
      current_status: 'In Transit - Delhi Hub',
      phone: '9876543210',
      lead_id: 'lead-001',
      is_rto: false,
      ndr_count: 0,
      tracking_url: 'https://shiprocket.co/track/SF123456789',
      created_at: '2024-01-18T14:00:00Z',
      shipped_at: '2024-01-19T10:00:00Z',
    },
    {
      id: 'order-002',
      order_number: 'NVH-2023-0892',
      status: 'delivered',
      total_amount: 899,
      awb_number: 'DL987654321',
      courier_name: 'Delhivery',
      current_status: 'Delivered',
      phone: '9876543210',
      lead_id: 'lead-001',
      is_rto: false,
      ndr_count: 0,
      created_at: '2023-11-10T11:00:00Z',
      shipped_at: '2023-11-11T09:00:00Z',
      delivered_at: '2023-11-14T15:30:00Z',
    },
    {
      id: 'order-003',
      order_number: 'NVH-2023-0456',
      status: 'rto',
      total_amount: 1299,
      awb_number: 'XP456789123',
      courier_name: 'XpressBees',
      current_status: 'Returned to Origin',
      phone: '9876543210',
      lead_id: 'lead-001',
      is_rto: true,
      ndr_count: 3,
      created_at: '2023-08-05T16:00:00Z',
      shipped_at: '2023-08-06T08:00:00Z',
    },
  ],
  callLogs: [
    {
      id: 'call-001',
      lead_id: 'lead-001',
      direction: 'outbound',
      duration_seconds: 245,
      status: 'completed',
      notes: 'Discussed product benefits, customer interested',
      created_at: '2024-01-20T14:45:00Z',
      agent_name: 'Priya Singh',
    },
    {
      id: 'call-002',
      lead_id: 'lead-001',
      direction: 'outbound',
      duration_seconds: 0,
      status: 'no_answer',
      created_at: '2024-01-19T11:30:00Z',
      agent_name: 'Priya Singh',
    },
    {
      id: 'call-003',
      lead_id: 'lead-001',
      direction: 'inbound',
      duration_seconds: 180,
      status: 'completed',
      notes: 'Customer inquired about product availability',
      created_at: '2024-01-18T16:20:00Z',
      agent_name: 'Priya Singh',
    },
  ],
  whatsappMessages: [
    {
      id: 'wa-001',
      lead_id: 'lead-001',
      direction: 'outbound',
      message: 'Namaste Rajesh ji! 🙏 Thank you for your interest in Naturavya Herbals. I will call you shortly to discuss our products.',
      status: 'read',
      created_at: '2024-01-20T14:30:00Z',
    },
    {
      id: 'wa-002',
      lead_id: 'lead-001',
      direction: 'inbound',
      message: 'Hi, I saw your ad for Ashwagandha. Please share details.',
      status: 'read',
      created_at: '2024-01-20T14:25:00Z',
    },
    {
      id: 'wa-003',
      lead_id: 'lead-001',
      direction: 'outbound',
      message: 'Your order NVH-2024-0156 has been shipped! Track here: https://shiprocket.co/track/SF123456789',
      template_name: 'order_shipped',
      status: 'delivered',
      created_at: '2024-01-19T10:05:00Z',
    },
  ],
  activities: [
    {
      id: 'act-001',
      lead_id: 'lead-001',
      type: 'call',
      title: 'Outbound call completed',
      description: '4 min 5 sec - Discussed product benefits',
      created_at: '2024-01-20T14:45:00Z',
      agent_name: 'Priya Singh',
    },
    {
      id: 'act-002',
      lead_id: 'lead-001',
      type: 'whatsapp',
      title: 'WhatsApp message sent',
      description: 'Sent greeting message',
      created_at: '2024-01-20T14:30:00Z',
      agent_name: 'Priya Singh',
    },
    {
      id: 'act-003',
      lead_id: 'lead-001',
      type: 'status_change',
      title: 'Status changed to Qualified',
      description: 'From: Contacted → To: Qualified',
      created_at: '2024-01-20T14:46:00Z',
      agent_name: 'Priya Singh',
    },
    {
      id: 'act-004',
      lead_id: 'lead-001',
      type: 'order_updated',
      title: 'Order shipped',
      description: 'Order NVH-2024-0156 dispatched via Shiprocket',
      created_at: '2024-01-19T10:00:00Z',
      agent_name: 'System',
    },
    {
      id: 'act-005',
      lead_id: 'lead-001',
      type: 'order_created',
      title: 'New order created',
      description: 'Order NVH-2024-0156 - ₹1,499',
      created_at: '2024-01-18T14:00:00Z',
      agent_name: 'Priya Singh',
    },
    {
      id: 'act-006',
      lead_id: 'lead-001',
      type: 'task_created',
      title: 'Task created',
      description: 'Follow-up call scheduled',
      created_at: '2024-01-18T10:00:00Z',
      agent_name: 'Priya Singh',
    },
  ],
  templates: [
    {
      id: 'tpl-001',
      name: 'Greeting',
      content: 'Namaste! 🙏 Thank you for your interest in Naturavya Herbals. How can I assist you today?',
      category: 'greeting',
    },
    {
      id: 'tpl-002',
      name: 'Product Info',
      content: 'Our Ashwagandha Gold is made from KSM-66, the world\'s most researched ashwagandha extract. Benefits include:\n✅ Stress Relief\n✅ Better Sleep\n✅ Increased Energy\n\nWould you like to know more?',
      category: 'product',
    },
    {
      id: 'tpl-003',
      name: 'Special Offer',
      content: '🎉 Special Offer for You!\n\nBuy 2, Get 1 FREE on all Naturavya products!\n\n✅ Free Shipping\n✅ COD Available\n✅ 30-Day Money Back Guarantee\n\nOrder now: naturavya.com',
      category: 'offer',
    },
    {
      id: 'tpl-004',
      name: 'Order Follow-up',
      content: 'Hi! Just checking in - did you receive your Naturavya order? We hope you\'re enjoying the products! 😊\n\nPlease let us know if you have any questions.',
      category: 'follow-up',
    },
  ],
  userRole: 'manager',
  agents: [
    { id: 'agent-001', name: 'Priya Singh' },
    { id: 'agent-002', name: 'Amit Verma' },
    { id: 'agent-003', name: 'Sneha Patel' },
  ],
};

export function App() {
  // In Next.js, this would be: const { leadid } = useParams();
  const leadId = DEMO_LEAD_ID;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [lead, setLead] = useState<Lead | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('agent');
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  // UI states
  const [showEditModal, setShowEditModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Fetch all lead data
  const fetchLeadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // In production, this would be actual API calls:
      // const res = await fetch(`/api/admin/leads/${leadId}/overview`, { credentials: 'include' });
      // const data: LeadOverviewResponse = await res.json();

      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Using mock data for demonstration
      const data = mockLeadData;

      setLead(data.lead);
      setTasks(data.tasks);
      setOrders(data.orders);
      setCallLogs(data.callLogs);
      setWhatsappMessages(data.whatsappMessages);
      setActivities(data.activities);
      setTemplates(data.templates);
      setUserRole(data.userRole);
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Failed to fetch lead data:', err);
      setError('Failed to load lead data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
    }
  }, [leadId, fetchLeadData]);

  // API handlers
  const handleCompleteTask = async (taskId: string) => {
    try {
      // await fetch(`/api/admin/tasks/${taskId}/complete`, { method: 'PATCH' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'completed' as const, completed_at: new Date().toISOString() } : t
        )
      );
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleSendWhatsApp = async (message: string, templateName?: string) => {
    try {
      // await fetch('/api/whatsapp/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ to: lead?.phone, text: message, template: templateName }),
      // });
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newMessage: WhatsAppMessage = {
        id: `wa-${Date.now()}`,
        lead_id: leadId,
        direction: 'outbound',
        message,
        template_name: templateName,
        status: 'sent',
        created_at: new Date().toISOString(),
      };
      setWhatsappMessages((prev) => [newMessage, ...prev]);
    } catch (err) {
      console.error('Failed to send WhatsApp:', err);
    }
  };

  const handleGenerateAI = async () => {
    setAiGenerating(true);
    try {
      // await fetch(`/api/admin/leads/${leadId}/ai`, { method: 'POST' });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In production, refetch data to get new AI content
      // For demo, the mock data already has AI content
    } catch (err) {
      console.error('Failed to generate AI content:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdateLead = async (data: Partial<Lead>) => {
    try {
      // await fetch(`/api/admin/leads/${leadId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLead((prev) => (prev ? { ...prev, ...data } : prev));
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  };

  const handleCreateOrder = () => {
    // In Next.js: router.push(`/admin/orders/manual?leadId=${lead?.id}`);
    alert(`Navigate to: /admin/orders/manual?leadId=${lead?.id}`);
  };

  const handleViewOrder = (orderId: string) => {
    // In Next.js: router.push(`/admin/orders/${orderId}`);
    alert(`Navigate to: /admin/orders/${orderId}`);
  };

  const handleWhatsAppClick = () => {
    if (lead?.phone) {
      window.open(`https://wa.me/91${lead.phone}`, '_blank');
    }
  };

  const handleCallClick = () => {
    if (lead?.phone) {
      window.open(`tel:+91${lead.phone}`, '_blank');
    }
  };

  const handleLogCall = () => {
    alert('Open call logging modal');
  };

  const handleAddTask = () => {
    alert('Open add task modal');
  };

  const handleBack = () => {
    // In Next.js: router.back() or router.push('/admin/crm/leads');
    alert('Navigate back to leads list');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 mb-4 shadow-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading lead details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'Lead not found'}
          </h2>
          <p className="text-gray-500 mb-6">
            The lead you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => fetchLeadData()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 hidden sm:block">Naturavya CRM</span>
              </div>
            </div>

            {/* Right: Refresh + Role Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchLeadData(true)}
                disabled={refreshing}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  refreshing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <span className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold capitalize',
                userRole === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                userRole === 'manager' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              )}>
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Lead Header */}
          <LeadHeader
            lead={lead}
            userRole={userRole}
            onEditLead={() => setShowEditModal(true)}
            onCreateOrder={handleCreateOrder}
            onWhatsAppClick={handleWhatsAppClick}
            onCallClick={handleCallClick}
          />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Lead Info + Tasks Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LeadInfoPanel
                  lead={lead}
                  onEdit={() => setShowEditModal(true)}
                />
                <TasksPanel
                  tasks={tasks}
                  userRole={userRole}
                  onCompleteTask={handleCompleteTask}
                  onAddTask={handleAddTask}
                />
              </div>

              {/* Orders Panel */}
              <OrdersPanel
                orders={orders}
                onViewOrder={handleViewOrder}
              />

              {/* Activity Timeline */}
              <ActivityTimeline activities={activities} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* AI Assistant */}
              <AIAssistantPanel
                lead={lead}
                onGenerateScript={handleGenerateAI}
                onSendWhatsApp={handleSendWhatsApp}
                isGenerating={aiGenerating}
              />

              {/* Communication Panel */}
              <CommunicationPanel
                callLogs={callLogs}
                whatsappMessages={whatsappMessages}
                templates={templates}
                onSendWhatsApp={handleSendWhatsApp}
                onLogCall={handleLogCall}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Edit Lead Modal */}
      <EditLeadModal
        lead={lead}
        agents={agents}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateLead}
      />
    </div>
  );
}
