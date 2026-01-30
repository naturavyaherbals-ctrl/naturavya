'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone, MapPin, Clock, CheckCircle, Package, Bot, Copy, Loader2,
  MessageCircle, Edit, AlertCircle, TrendingUp, Calendar, User,
  ExternalLink, Send, Check, X, ChevronDown, ChevronUp, Truck,
  AlertTriangle, Activity, Tag, Building2, RefreshCw, Zap,
  PhoneCall, Award, Timer, MessageSquare, ShoppingCart,
  Flame, Save, Pencil, Star,
} from 'lucide-react';

type Lead = {
  id: string;
  full_name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: string;
  score: number;
  temperature: string;
  source?: string;
  campaign_name?: string;
  ai_suggested_message?: string;
  assigned_to?: string;
  assigned_agent_name?: string;
  created_at?: string;
  last_contacted?: string;
  budget?: number;
  pain_points?: string[];
  objections?: string[];
  interested_products?: string[];
  conversion_probability?: number;
  next_follow_up?: string;
  engagement_score?: number;
  response_rate?: number;
};

type Task = {
  id: string;
  title: string;
  status: string;
  due_at?: string;
  priority?: string;
  assigned_to?: string;
  type?: string;
};

type TrackingEvent = {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  amount?: number;
  awb_number?: string;
  courier_name?: string;
  current_status?: string;
  is_rto?: boolean;
  ndr_count?: number;
  created_at?: string;
  updated_at?: string;
  tracking_data?: TrackingEvent[];
  expected_delivery?: string;
  last_location?: string;
  lead_id?: string;
};

type NextAction = {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  type: 'call' | 'message' | 'email' | 'task' | 'order';
  icon: any;
  action: () => void;
  automated?: boolean;
};

type ActivityItem = {
  id: string;
  type: 'status' | 'task' | 'order' | 'call' | 'message';
  description: string;
  timestamp: string;
};

type UserRole = 'agent' | 'manager' | 'superadmin';

type EditFormData = {
  full_name: string;
  phone: string;
  alternate_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  temperature: string;
};

const temperatureColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-800 border-red-200',
  warm: 'bg-orange-100 text-orange-800 border-orange-200',
  cold: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

export default function LeadDetailsPage() {
  const params = useParams();
  const leadid = params.leadid as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('agent');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    nextAction: true,
    tasks: true,
    orders: true,
    communication: true,
    ai: true,
    timeline: true,
  });
  
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editOrderStatus, setEditOrderStatus] = useState('');
  const [editAwbNumber, setEditAwbNumber] = useState('');
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadRes, tasksRes, ordersRes] = await Promise.all([
        fetch(`/api/admin/leads/${leadid}/overview`, { credentials: 'include' }),
        fetch(`/api/admin/tasks?leadId=${leadid}`, { credentials: 'include' }),
        fetch(`/api/admin/orders?leadId=${leadid}`, { credentials: 'include' }),
      ]);

      if (!leadRes.ok) {
        if (leadRes.status === 404) {
          setError('Lead not found');
          return;
        }
        throw new Error('Failed to fetch lead data');
      }

      const leadData = await leadRes.json();
      const tasksData = tasksRes.ok ? await tasksRes.json() : { tasks: [] };
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };

      const leadInfo = leadData.lead || leadData;
      
      const leadSpecificOrders = (ordersData.orders || ordersData || []).filter(
        (order: Order) => {
          if (order.lead_id) {
            return order.lead_id === leadid;
          }
          return true;
        }
      );
      
      if (!leadInfo || !leadInfo.id) {
        setError('Invalid lead data');
        return;
      }

      setLead(leadInfo);
      setTasks(tasksData.tasks || tasksData || []);
      setOrders(leadSpecificOrders);
      
      if (leadData.user_role) {
        setUserRole(leadData.user_role as UserRole);
      }

      const activityItems: ActivityItem[] = [];
      
      if (leadInfo.created_at) {
        activityItems.push({
          id: 'lead-created',
          type: 'status',
          description: 'Lead created',
          timestamp: leadInfo.created_at,
        });
      }

      const tasksList = tasksData.tasks || tasksData || [];
      tasksList.forEach((task: Task) => {
        if (task.status === 'completed') {
          activityItems.push({
            id: `task-${task.id}`,
            type: 'task',
            description: `Task completed: ${task.title}`,
            timestamp: task.due_at || new Date().toISOString(),
          });
        }
      });

      leadSpecificOrders.forEach((order: Order) => {
        activityItems.push({
          id: `order-${order.id}`,
          type: 'order',
          description: `Order ${order.order_number} - ${order.current_status || order.status}`,
          timestamp: order.created_at || new Date().toISOString(),
        });
      });

      setActivities(activityItems.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lead data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadid) {
      fetchAll();
    }
  }, [leadid]);

  const calculateNextActions = (): NextAction[] => {
    if (!lead) return [];
    
    const actions: NextAction[] = [];
    const now = new Date();
    const lastContact = lead.last_contacted ? new Date(lead.last_contacted) : null;
    const hoursSinceContact = lastContact ? (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60) : 999;

    orders.forEach((order) => {
      const statusLower = (order.current_status || order.status || '').toLowerCase();

      if (order.ndr_count && order.ndr_count > 0) {
        actions.push({
          id: `ndr-${order.id}`,
          title: `🚨 URGENT NDR: Order #${order.order_number}`,
          description: `${order.ndr_count} delivery attempt(s) FAILED! Call ${lead.full_name} RIGHT NOW to resolve address/availability issue.`,
          priority: 'urgent',
          type: 'call',
          icon: AlertTriangle,
          action: () => window.open(`tel:${lead.phone}`),
        });
      }

      if (order.is_rto) {
        actions.push({
          id: `rto-${order.id}`,
          title: `❌ RTO ALERT: Order #${order.order_number} Returning!`,
          description: 'Order is returning to origin - revenue at risk! Contact customer immediately.',
          priority: 'urgent',
          type: 'call',
          icon: Truck,
          action: () => window.open(`tel:${lead.phone}`),
        });
      }

      if (statusLower.includes('out for delivery')) {
        actions.push({
          id: `ofd-${order.id}`,
          title: `📦 Out for Delivery TODAY: #${order.order_number}`,
          description: `Send WhatsApp NOW to confirm ${lead.full_name} is available.`,
          priority: 'high',
          type: 'message',
          icon: Truck,
          action: () => sendWhatsApp(`Hi ${lead.full_name}! 🎉 Great news - your order #${order.order_number} is out for delivery today!`),
        });
      }

      if (!order.awb_number && order.created_at) {
        const hoursSinceOrder = (now.getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceOrder > 24) {
          actions.push({
            id: `no-awb-${order.id}`,
            title: `⚠️ UPDATE TRACKING: Order #${order.order_number}`,
            description: 'No AWB tracking number! Update AWB immediately.',
            priority: 'high',
            type: 'task',
            icon: Package,
            action: () => {
              setEditingOrderId(order.id);
              setEditOrderStatus(order.status);
              setEditAwbNumber('');
            },
          });
        }
      }
    });

    if (lead.next_follow_up) {
      const followUpTime = new Date(lead.next_follow_up);
      const hoursUntilFollowUp = (followUpTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilFollowUp < 0) {
        actions.push({
          id: 'followup-overdue',
          title: 'URGENT: Follow-up Overdue!',
          description: `Call ${lead.full_name} immediately - follow-up was due ${Math.abs(Math.floor(hoursUntilFollowUp))} hours ago`,
          priority: 'urgent',
          type: 'call',
          icon: AlertTriangle,
          action: () => window.open(`tel:${lead.phone}`),
        });
      }
    }

    if (lead.temperature === 'hot' && hoursSinceContact > 6) {
      actions.push({
        id: 'hot-lead-contact',
        title: 'Hot Lead Needs Attention',
        description: `Last contact was ${Math.floor(hoursSinceContact)} hours ago. Call now!`,
        priority: 'high',
        type: 'call',
        icon: Flame,
        action: () => window.open(`tel:${lead.phone}`),
      });
    }

    if (lead.status === 'qualified' && orders.length === 0) {
      actions.push({
        id: 'create-order',
        title: 'Create Order - Lead is Qualified',
        description: `${lead.full_name} is ready to buy. Create order NOW`,
        priority: 'high',
        type: 'order',
        icon: ShoppingCart,
        action: () => router.push(`/admin/orders/manual?leadId=${lead.id}`),
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const updateOrderStatus = async (orderId: string) => {
    if (!editOrderStatus && !editAwbNumber) {
      alert('Please enter status or AWB number');
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: editOrderStatus || undefined,
          awb_number: editAwbNumber || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      if (editAwbNumber && editAwbNumber.trim()) {
        await fetchShiprocketTracking(orderId, editAwbNumber.trim());
      }

      setEditingOrderId(null);
      setEditOrderStatus('');
      setEditAwbNumber('');
      await fetchAll();
      alert('✅ Order updated successfully!');
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order. Please try again.');
    }
  };

  const fetchShiprocketTracking = async (orderId: string, awbNumber: string) => {
    setTrackingLoading(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/tracking?awb=${awbNumber}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }

      await fetchAll();
    } catch (err) {
      console.error('Error fetching tracking:', err);
      alert('⚠️ Failed to fetch Shiprocket tracking.');
    } finally {
      setTrackingLoading(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getOrderStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'bg-green-100 text-green-800 border-green-300';
    if (statusLower.includes('transit') || statusLower.includes('shipped')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (statusLower.includes('ndr')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (statusLower.includes('rto') || statusLower.includes('cancelled')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const response = await fetch(`/api/admin/leads/${leadid}/ai`, { 
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate AI script');
      }
      
      await fetchAll();
    } catch (err) {
      console.error('Error generating AI script:', err);
      alert('Failed to generate AI script.');
    } finally {
      setAiLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete task');
      }
      
      await fetchAll();
    } catch (err) {
      console.error('Error completing task:', err);
      alert('Failed to complete task.');
    }
  };

  const sendWhatsApp = async (message: string) => {
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: lead?.phone,
          text: message,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }
      
      alert('WhatsApp message sent successfully');
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
      alert('Failed to send WhatsApp message.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const openEditModal = () => {
    if (!lead) return;
    
    setEditFormData({
      full_name: lead.full_name || '',
      phone: lead.phone || '',
      alternate_phone: lead.alternate_phone || '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      pincode: lead.pincode || '',
      status: lead.status || 'new',
      temperature: lead.temperature || 'cold',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !lead) return;

    setEditLoading(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      setShowEditModal(false);
      await fetchAll();
      alert('Lead updated successfully');
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead.');
    } finally {
      setEditLoading(false);
    }
  };

  const getTimeUntilFollowUp = () => {
    if (!lead?.next_follow_up) return null;
    const now = new Date();
    const followUp = new Date(lead.next_follow_up);
    const diff = followUp.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return { text: 'OVERDUE', color: 'text-red-600', bg: 'bg-red-100' };
    if (hours === 0) return { text: `${minutes}m`, color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: `${hours}h ${minutes}m`, color: 'text-green-600', bg: 'bg-green-100' };
  };

  const nextActions = calculateNextActions();
  const canEdit = userRole === 'manager' || userRole === 'superadmin';
  const followUpTimer = getTimeUntilFollowUp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {error === 'Lead not found' ? 'Lead Not Found' : 'Error Loading Lead'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {error || 'The lead you are looking for does not exist.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/crm/leads')}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Leads
            </button>
            <button
              onClick={fetchAll}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {lead.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{lead.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">{lead.phone}</span>
                    </div>
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status]}`}>
                      {lead.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${temperatureColors[lead.temperature]}`}>
                      🔥 {lead.temperature.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Score: {lead.score}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {followUpTimer && (
                <div className={`px-4 py-2 ${followUpTimer.bg} ${followUpTimer.color} rounded-lg font-bold flex items-center gap-2`}>
                  <Timer className="w-5 h-5" />
                  <div>
                    <div className="text-xs opacity-80">Next Follow-up</div>
                    <div className="text-lg">{followUpTimer.text}</div>
                  </div>
                </div>
              )}
              {canEdit && (
                <button
                  onClick={openEditModal}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              <button
                onClick={() => router.push(`/admin/orders/manual?leadId=${lead.id}`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 font-semibold shadow-lg"
              >
                <Package className="w-4 h-4" />
                Create Order
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Next Best Actions */}
            {nextActions.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg border-2 border-orange-200">
                <div 
                  className="p-6 border-b-2 border-orange-200 flex items-center justify-between cursor-pointer hover:bg-white/50"
                  onClick={() => toggleSection('nextAction')}
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-orange-600" />
                    🤖 Staff Action Guide
                    <span className="bg-orange-600 text-white text-sm font-bold px-2.5 py-1 rounded-full animate-pulse">
                      {nextActions.length}
                    </span>
                  </h2>
                  {expandedSections.nextAction ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                {expandedSections.nextAction && (
                  <div className="p-6 space-y-3">
                    {nextActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <div 
                          key={action.id} 
                          className={`border-2 rounded-xl p-4 bg-white hover:shadow-lg cursor-pointer ${priorityColors[action.priority]}`}
                          onClick={action.action}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${action.priority === 'urgent' ? 'bg-red-100' : 'bg-orange-100'}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
                              <p className="text-sm text-gray-700 mb-3">{action.description}</p>
                              <button className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                                action.priority === 'urgent' 
                                  ? 'bg-red-600 text-white hover:bg-red-700' 
                                  : 'bg-orange-600 text-white hover:bg-orange-700'
                              }`}>
                                {action.type === 'call' && 'Call Now'}
                                {action.type === 'message' && 'Send Message'}
                                {action.type === 'order' && 'Create Order'}
                                {action.type === 'task' && 'Complete Task'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div 
                className="p-6 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection('orders')}
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  📦 {lead.full_name}'s Orders Only
                  {orders.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </h2>
                {expandedSections.orders ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.orders && (
                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No orders yet for {lead.full_name}</p>
                      <button
                        onClick={() => router.push(`/admin/orders/manual?leadId=${lead.id}`)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Create First Order
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 bg-gradient-to-r from-white to-gray-50">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 flex-wrap mb-2">
                                Order #{order.order_number}
                                {order.is_rto && (
                                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                    <AlertTriangle className="w-4 h-4" />
                                    RTO
                                  </span>
                                )}
                                {order.ndr_count && order.ndr_count > 0 && (
                                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                    <AlertCircle className="w-4 h-4" />
                                    NDR: {order.ndr_count}
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getOrderStatusColor(order.current_status || order.status)}`}>
                                  {(order.current_status || order.status).toUpperCase()}
                                </span>
                                {order.amount && (
                                  <span className="text-green-600 font-bold text-lg">₹{order.amount.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              {expandedOrders.has(order.id) ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                              <span className="text-gray-500">Courier:</span>
                              <p className="font-medium text-gray-900 flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {order.courier_name || 'Not assigned'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">AWB:</span>
                              <p className="font-medium text-gray-900">{order.awb_number || '⚠️ Pending'}</p>
                            </div>
                          </div>

                          {order.awb_number && (
                            <div className="flex gap-2 mb-4">
                              <a
                                href={`https://shiprocket.co/tracking/${order.awb_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-3 py-2 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold flex items-center justify-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Track Shipment
                              </a>
                              <button
                                onClick={() => fetchShiprocketTracking(order.id, order.awb_number!)}
                                disabled={trackingLoading === order.id}
                                className="px-4 py-2 bg-green-50 border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-100 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                              >
                                {trackingLoading === order.id ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                                ) : (
                                  <><RefreshCw className="w-4 h-4" /> Update</>
                                )}
                              </button>
                            </div>
                          )}

                          <div className="border-t-2 border-gray-200 pt-4">
                            {editingOrderId === order.id ? (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                  <Pencil className="w-4 h-4" />
                                  Update Order Status & AWB
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                                    <select
                                      value={editOrderStatus}
                                      onChange={(e) => setEditOrderStatus(e.target.value)}
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                                    >
                                      <option value="">-- Select --</option>
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="in_transit">In Transit</option>
                                      <option value="out_for_delivery">Out for Delivery</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="ndr">NDR</option>
                                      <option value="rto">RTO</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">AWB Number</label>
                                    <input
                                      type="text"
                                      value={editAwbNumber}
                                      onChange={(e) => setEditAwbNumber(e.target.value)}
                                      placeholder="Enter AWB from Shiprocket"
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingOrderId(null);
                                        setEditOrderStatus('');
                                        setEditAwbNumber('');
                                      }}
                                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => updateOrderStatus(order.id)}
                                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                                    >
                                      <Save className="w-4 h-4" />
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingOrderId(order.id);
                                  setEditOrderStatus(order.status);
                                  setEditAwbNumber(order.awb_number || '');
                                }}
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center justify-center gap-2 shadow-lg"
                              >
                                <Pencil className="w-4 h-4" />
                                Update Status & AWB
                              </button>
                            )}
                          </div>

                          {expandedOrders.has(order.id) && order.tracking_data && order.tracking_data.length > 0 && (
                            <div className="mt-4 border-t-2 border-gray-200 pt-4">
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Tracking Timeline
                              </h4>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {order.tracking_data.map((event) => (
                                  <div key={event.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 text-sm">{event.status}</p>
                                      <p className="text-xs text-gray-600">{event.description}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {event.location}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(event.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div 
                className="p-6 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection('tasks')}
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Pending Tasks
                  {tasks.filter(t => t.status !== 'completed').length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {tasks.filter(t => t.status !== 'completed').length}
                    </span>
                  )}
                </h2>
                {expandedSections.tasks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.tasks && (
                <div className="p-6">
                  {tasks.filter(t => t.status !== 'completed').length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No pending tasks</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.filter(t => t.status !== 'completed').map(task => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              {task.due_at && (
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(task.due_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => completeTask(task.id)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              Complete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200">
              <div 
                className="p-6 border-b border-purple-200 flex items-center justify-between cursor-pointer hover:bg-white/50"
                onClick={() => toggleSection('ai')}
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI Assistant
                </h2>
                {expandedSections.ai ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.ai && (
                <div className="p-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 min-h-[140px]">
                    {lead.ai_suggested_message ? (
                      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {lead.ai_suggested_message}
                      </p>
                    ) : (
                      <div className="text-center py-6">
                        <Bot className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No AI script generated yet</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={generateAI}
                      disabled={aiLoading}
                      className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" />
                          Generate Script
                        </>
                      )}
                    </button>
                    {lead.ai_suggested_message && (
                      <>
                        <button
                          onClick={() => copyToClipboard(lead.ai_suggested_message!)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => sendWhatsApp(lead.ai_suggested_message!)}
                          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send via WhatsApp
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div 
                className="p-6 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection('timeline')}
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Activity Timeline
                </h2>
                {expandedSections.timeline ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.timeline && (
                <div className="p-6">
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            {activity.type === 'status' && <Activity className="w-4 h-4 text-blue-600" />}
                            {activity.type === 'task' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {activity.type === 'order' && <Package className="w-4 h-4 text-purple-600" />}
                            {activity.type === 'call' && <Phone className="w-4 h-4 text-orange-600" />}
                            {activity.type === 'message' && <MessageCircle className="w-4 h-4 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Edit Lead</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editFormData.state}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                    <select
                      value={editFormData.temperature}
                      onChange={(e) => setEditFormData({ ...editFormData, temperature: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}