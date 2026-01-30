'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
Phone,
MapPin,
Clock,
CheckCircle2,
Package,
Flame,
Bot,
Copy,
Loader2,
MessageCircle,
Edit3,
User,
Calendar,
AlertCircle,
ArrowLeft,
Send,
RefreshCw,
MoreVertical,
Truck,
AlertTriangle,
CheckCircle,
XCircle,
FileText,
PhoneCall,
MessageSquare,
Thermometer,
TrendingUp,
ShoppingBag,
WhatsappLogo,
Plus,
ChevronRight,
Hash
} from 'lucide-react';
type UserRole = 'agent' | 'manager' | 'superadmin';
type Lead = {
id: string;
full_name: string;
phone: string;
alternate_phone?: string;
address?: string;
city?: string;
state?: string;
pincode?: string;
status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
score: number;
temperature: 'hot' | 'warm' | 'cold';
source?: string;
campaign_name?: string;
assigned_to?: string;
assigned_to_name?: string;
ai_suggested_message?: string;
created_at?: string;
updated_at?: string;
};
type Task = {
id: string;
title: string;
status: 'pending' | 'completed' | 'overdue';
due_at?: string;
priority: 'low' | 'medium' | 'high';
assigned_to?: string;
assigned_to_name?: string;
};
type Order = {
id: string;
order_number: string;
status: string;
awb_number?: string;
courier_name?: string;
current_status?: string;
phone?: string;
lead_id?: string;
is_rto?: boolean;
ndr_count?: number;
created_at?: string;
total_amount?: number;
};
type Activity = {
id: string;
type: 'status_change' | 'task_created' | 'task_completed' | 'order_created' | 'call_made' | 'message_sent' | 'note_added' | 'lead_updated';
description: string;
created_at: string;
user?: string;
metadata?: any;
};
type Toast = {
id: string;
message: string;
type: 'success' | 'error' | 'info';
};
export default function LeadDetailsPage() {
const { leadid } = useParams();
const router = useRouter();
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [lead, setLead] = useState<Lead | null>(null);
const [tasks, setTasks] = useState<Task[]>([]);
const [orders, setOrders] = useState<Order[]>([]);
const [activities, setActivities] = useState<Activity[]>([]);
const [userRole, setUserRole] = useState<UserRole>
const [aiLoading, setAiLoading] = useState(false);
const [aiScript, setAiScript] = useState<string>
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editingLead, setEditingLead] = useState<Partial<Lead>
const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
const [toasts, setToasts] = useState<Toast[]>([]);
const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
const addToast = (message: string, type: Toast['type'] = 'info') => {
const id = Math.random().toString(36).substr(2, 9);
setToasts(prev => [...prev, { id, message, type }]);
setTimeout(() => {
setToasts(prev => prev.filter(t => t.id !== id));
}, 3000);
};
const fetchAllData = useCallback(async () => {
setLoading(true);
setError(null);
try {
const [overviewRes, tasksRes, ordersRes] = await Promise.all([
fetch(/api/admin/leads/${leadid}/overview, { credentials: 'include' }),
fetch(/api/admin/tasks?leadId=${leadid}, { credentials: 'include' }),
fetch(/api/admin/orders?leadId=${leadid}, { credentials: 'include' })
]);
 if (!overviewRes.ok) throw new Error('Failed to fetch lead overview');
  
  const overviewData = await overviewRes.json();
  setLead(overviewData.lead);
  setUserRole(overviewData.userRole || 'agent');
  setAiScript(overviewData.lead?.ai_suggested_message || '');
  
  if (tasksRes.ok) {
    const tasksData = await tasksRes.json();
    setTasks(tasksData.tasks || []);
  }
  
  if (ordersRes.ok) {
    const ordersData = await ordersRes.json();
    setOrders(ordersData.orders || []);
  }

  // Generate mock activities from available data or fetch separately if API supports
  const mockActivities: Activity[] = [
    ...(overviewData.lead?.created_at ? [{
      id: '1',
      type: 'lead_updated' as const,
      description: 'Lead created',
      created_at: overviewData.lead.created_at,
      user: 'System'
    }] : []),
    ...tasksData.tasks.map((t: Task) => ({
      id: `task-${t.id}`,
      type: (t.status === 'completed' ? 'task_completed' : 'task_created') as Activity['type'],
      description: `Task ${t.status === 'completed' ? 'completed' : 'created'}: ${t.title}`,
      created_at: t.due_at || new Date().toISOString(),
      user: t.assigned_to_name
    })),
    ...ordersData.orders.map((o: Order) => ({
      id: `order-${o.id}`,
      type: 'order_created' as const,
      description: `Order #${o.order_number} created - ${o.status}`,
      created_at: o.created_at || new Date().toISOString(),
      user: 'System'
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  setActivities(mockActivities);
  
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
  addToast('Failed to load lead data', 'error');
} finally {
  setLoading(false);
}
}, [leadid]);
useEffect(() => {
if (leadid) fetchAllData();
}, [leadid, fetchAllData]);
const handleGenerateAI = async () => {
setAiLoading(true);
try {
const res = await fetch(/api/admin/leads/${leadid}/ai, {
method: 'POST',
credentials: 'include'
});
if (!res.ok) throw new Error('AI generation failed');
const data = await res.json();
setAiScript(data.script || data.message || '');
addToast('AI script generated successfully', 'success');
} catch (err) {
addToast('Failed to generate AI script', 'error');
} finally {
setAiLoading(false);
}
};
const handleCopyScript = () => {
navigator.clipboard.writeText(aiScript || lead?.ai_suggested_message || '');
setCopied(true);
addToast('Copied to clipboard', 'success');
setTimeout(() => setCopied(false), 2000);
};
const handleSendWhatsApp = async (message: string) => {
if (!lead?.phone) return;
setSendingWhatsApp(true);
try {
const res = await fetch('/api/whatsapp/send', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
credentials: 'include',
body: JSON.stringify({
to: lead.phone,
text: message
})
});
if (!res.ok) throw new Error('Failed to send');
addToast('WhatsApp message sent', 'success');
} catch (err) {
addToast('Failed to send WhatsApp', 'error');
} finally {
setSendingWhatsApp(false);
}
};
const handleCompleteTask = async (taskId: string) => {
setCompletingTaskId(taskId);
try {
const res = await fetch(/api/admin/tasks/${taskId}/complete, {
method: 'PATCH',
credentials: 'include'
});
if (!res.ok) throw new Error('Failed to complete task');
setTasks(prev => prev.map(t =>
t.id === taskId ? { ...t, status: 'completed' } : t
));
addToast('Task completed', 'success');
} catch (err) {
addToast('Failed to complete task', 'error');
} finally {
setCompletingTaskId(null);
}
};
const handleSaveLead = async () => {
setSavingLead(true);
try {
const res = await fetch(/api/admin/leads/${leadid}, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
credentials: 'include',
body: JSON.stringify(editingLead)
});
if (!res.ok) throw new Error('Failed to update');
setLead(prev => prev ? { ...prev, ...editingLead } : null);
setIsEditModalOpen(false);
addToast('Lead updated successfully', 'success');
} catch (err) {
addToast('Failed to update lead', 'error');
} finally {
setSavingLead(false);
}
};
const getStatusColor = (status: string) => {
const colors: Record<string, string> = {
new: 'bg-blue-100 text-blue-800 border-blue-200',
contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
qualified: 'bg-green-100 text-green-800 border-green-200',
converted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
lost: 'bg-gray-100 text-gray-800 border-gray-200',
pending: 'bg-orange-100 text-orange-800 border-orange-200',
completed: 'bg-green-100 text-green-800 border-green-200',
overdue: 'bg-red-100 text-red-800 border-red-200'
};
return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};
const getTemperatureColor = (temp: string) => {
const colors: Record<string, string> = {
hot: 'bg-red-50 text-red-700 border-red-200',
warm: 'bg-amber-50 text-amber-700 border-amber-200',
cold: 'bg-blue-50 text-blue-700 border-blue-200'
};
return colors[temp] || 'bg-gray-50 text-gray-700';
};
const getPriorityColor = (priority: string) => {
const colors: Record<string, string> = {
high: 'bg-red-100 text-red-700',
medium: 'bg-yellow-100 text-yellow-700',
low: 'bg-green-100 text-green-700'
};
return colors[priority] || 'bg-gray-100 text-gray-700';
};
const formatDate = (dateString?: string) => {
if (!dateString) return '-';
return new Date(dateString).toLocaleDateString('en-IN', {
day: 'numeric',
month: 'short',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
};
const canEdit = userRole === 'manager' || userRole === 'superadmin';
const canAssign = userRole === 'manager' || userRole === 'superadmin';
if (loading) {
return (
<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /><p className="text-slate-600 font-medium">
);
}
if (error || !lead) {
return (
<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-slate-900 mb-2">
<p className="text-slate-600 mb-6">
<div className="flex gap-3 justify-center"><button
           onClick={fetchAllData}
           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
         ><RefreshCw className="w-4 h-4" />
<button
onClick={() => router.back()}
className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
>
<ArrowLeft className="w-4 h-4" />
);
}
return (
<div className="min-h-screen bg-slate-50"><div className="fixed top-4 right-4 z-50 space-y-2">
))}
  {/* Header Section */}
  <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{lead.full_name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTemperatureColor(lead.temperature)} capitalize`}>
                {lead.temperature}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)} capitalize`}>
                {lead.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span className="font-medium">{lead.phone}</span>
              </div>
              {lead.alternate_phone && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-xs">Alt:</span>
                  <span>{lead.alternate_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Assigned: {lead.assigned_to_name || lead.assigned_to || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Score: <span className="font-semibold text-slate-900">{lead.score}/100</span></span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <button
            onClick={() => router.push(`/admin/orders/manual?leadId=${lead.id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Create Order
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setEditingLead(lead);
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Lead
            </button>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column - Main Info */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Lead Information Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Lead Information
            </h2>
            {canEdit && (
              <button
                onClick={() => {
                  setEditingLead(lead);
                  setIsEditModalOpen(true);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Edit Details
              </button>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Address</label>
                <p className="mt-1 text-sm text-slate-900">
                  {lead.address ? (
                    <>{lead.address}{lead.city && <>, {lead.city}</>}{lead.state && <>, {lead.state}</>}{lead.pincode && <> - {lead.pincode}</>}</>
                  ) : (
                    <span className="text-slate-400 italic">No address provided</span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</label>
                  <p className="mt-1 text-sm text-slate-900 capitalize">{lead.source || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</label>
                  <p className="mt-1 text-sm text-slate-900">{lead.campaign_name || '-'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Score</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${lead.score >= 70 ? 'bg-green-500' : lead.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{lead.score}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</label>
                  <p className="mt-1 text-sm text-slate-900">{formatDate(lead.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</label>
                  <p className="mt-1 text-sm text-slate-900">{formatDate(lead.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders & Delivery Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              Orders & Delivery
              <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                {orders.length}
              </span>
            </h2>
          </div>
          <div className="divide-y divide-slate-200">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No orders linked to this lead</p>
                <button
                  onClick={() => router.push(`/admin/orders/manual?leadId=${lead.id}`)}
                  className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
                >
                  Create first order
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">#{order.order_number}</span>
                        {order.is_rto && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            RTO
                          </span>
                        )}
                        {order.ndr_count && order.ndr_count > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-medium">
                            NDR ({order.ndr_count})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span>•</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {order.awb_number && (
                        <a
                          href={`https://shiprocket.co/tracking/${order.awb_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          <Truck className="w-4 h-4" />
                          Track
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  {(order.awb_number || order.courier_name) && (
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {order.courier_name && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500">Courier:</span>
                          <span className="font-medium">{order.courier_name}</span>
                        </div>
                      )}
                      {order.awb_number && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500">AWB:</span>
                          <span className="font-medium font-mono">{order.awb_number}</span>
                        </div>
                      )}
                      {order.current_status && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-xs text-slate-500">Current:</span>
                          <span className="font-medium">{order.current_status}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Tasks Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Pending Tasks
              <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                {tasks.filter(t => t.status !== 'completed').length}
              </span>
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
          <div className="divide-y divide-slate-200">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No pending tasks</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={task.status === 'completed' || completingTaskId === task.id}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.status === 'completed' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-slate-300 hover:border-indigo-500 group-hover:border-indigo-400'
                        }`}
                      >
                        {completingTaskId === task.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : task.status === 'completed' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : null}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.due_at && (
                            <span className={`text-xs flex items-center gap-1 ${
                              new Date(task.due_at) < new Date() && task.status !== 'completed' 
                                ? 'text-red-600 font-medium' 
                                : 'text-slate-500'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              Due {formatDate(task.due_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {task.assigned_to_name && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        {task.assigned_to_name}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timeline / Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Activity Timeline
            </h2>
          </div>
          <div className="p-6">
            <div className="relative space-y-6">
              {activities.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">No activities recorded yet</p>
              ) : (
                activities.map((activity, index) => (
                  <div key={activity.id} className="relative flex gap-4">
                    {index !== activities.length - 1 && (
                      <div className="absolute left-2 top-8 bottom-[-24px] w-0.5 bg-slate-200" />
                    )}
                    <div className={`relative z-10 w-4 h-4 rounded-full border-2 mt-1.5 ${
                      activity.type === 'order_created' ? 'bg-green-100 border-green-500' :
                      activity.type === 'task_completed' ? 'bg-blue-100 border-blue-500' :
                      activity.type === 'task_created' ? 'bg-yellow-100 border-yellow-500' :
                      'bg-slate-100 border-slate-500'
                    }`} />
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-slate-900">{activity.description}</p>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                      {activity.user && (
                        <p className="text-xs text-slate-500 mt-0.5">by {activity.user}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - AI & Communication */}
      <div className="space-y-6">
        
        {/* AI Assistant Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              AI Assistant
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {!aiScript && !lead.ai_suggested_message ? (
              <div className="text-center py-6">
                <Bot className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-600 mb-4">Generate an AI-powered call script or objection handler</p>
                <button
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4" />
                      Generate Script
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {aiScript || lead.ai_suggested_message}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleGenerateAI}
                    disabled={aiLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
                <button
                  onClick={() => handleSendWhatsApp(aiScript || lead.ai_suggested_message || '')}
                  disabled={sendingWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {sendingWhatsApp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  Send via WhatsApp
                </button>
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => addToast('Opening objection handler...', 'info')}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors text-left"
                >
                  Objection Handler
                </button>
                <button 
                  onClick={() => addToast('Next best action loaded', 'info')}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors text-left"
                >
                  Next Action
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-slate-500" />
              Communication
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <button
                onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </button>
              
              <a
                href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp
              </a>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Templates</h3>
              <div className="space-y-2">
                {['Welcome Message', 'Follow-up', 'Payment Reminder', 'Delivery Update'].map((template) => (
                  <button
                    key={template}
                    onClick={() => handleSendWhatsApp(`[${template}] Hello ${lead.full_name}, `)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between group"
                  >
                    <span>{template}</span>
                    <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Last contacted</span>
                <span className="font-medium text-slate-700">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Lead Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Response Rate</span>
              <span className="text-sm font-semibold text-slate-900">85%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-slate-600">Conversion Probability</span>
              <span className="text-sm font-semibold text-slate-900">{lead.score}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${lead.score >= 70 ? 'bg-green-500' : lead.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${lead.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Edit Lead Modal */}
  {isEditModalOpen && (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:align-middle">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Edit Lead Details</h3>
            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={editingLead.full_name || ''}
                onChange={(e) => setEditingLead({...editingLead, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingLead.phone || ''}
                  onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alt Phone</label>
                <input
                  type="text"
                  value={editingLead.alternate_phone || ''}
                  onChange={(e) => setEditingLead({...editingLead, alternate_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea
                value={editingLead.address || ''}
                onChange={(e) => setEditingLead({...editingLead, address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={editingLead.status || ''}
                  onChange={(e) => setEditingLead({...editingLead, status: e.target.value as Lead['status']})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temperature</label>
                <select
                  value={editingLead.temperature || ''}
                  onChange={(e) => setEditingLead({...editingLead, temperature: e.target.value as Lead['temperature']})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editingLead.score || 0}
                onChange={(e) => setEditingLead({...editingLead, score: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLead}
              disabled={savingLead}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingLead ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
}