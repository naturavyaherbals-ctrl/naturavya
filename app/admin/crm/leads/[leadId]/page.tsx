'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, Tag, User, 
  Clock, Edit, X, Save, Loader2, UserPlus, Package, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.leadId as string;
  const supabase = createClient();

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  // Fetch lead data and current user role
  const fetchLead = async () => {
    if (!leadId) return;
    try {
      // 1. Get Lead
      const res = await fetch(`/api/admin/leads/${leadId}`);
      const data = await res.json();
      if (data.lead) setLead(data.lead);

      // 2. Get User Role for permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: member } = await supabase
          .from('team_members')
          .select('role')
          .eq('user_id', user.id)
          .single();
        setUserRole(member?.role || 'agent');
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  // Handler to navigate to manual order with pre-filled details
  const handleCreateOrder = () => {
    const query = new URLSearchParams({
      name: lead.full_name,
      phone: lead.phone,
      email: lead.email || '',
      leadId: lead.id
    }).toString();
    router.push(`/admin/orders/manual?${query}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
  
  if (!lead) return (
    <div className="p-8 text-center text-red-500">
      <p>Lead not found</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 underline">Go Back</button>
    </div>
  );

  const canEdit = ['super_admin', 'admin'].includes(userRole) || lead.assigned_to === lead.current_user_team_id;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> 
            Back to leads
          </button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-blue-100">
                  {lead.full_name?.[0]}
               </div>
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">{lead.full_name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Created {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* CREATE ORDER BUTTON */}
              <button 
                onClick={handleCreateOrder}
                className="px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 shadow-lg shadow-orange-100 flex items-center gap-2 transition-all active:scale-95 font-bold"
              >
                <Package size={18} />
                Create Order
              </button>

              <button 
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 flex items-center gap-2 transition-all font-bold"
              >
                <Edit size={18} />
                Edit Details
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <User className="w-5 h-5 text-blue-500" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" /> {lead.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" /> {lead.email || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</p>
                  <p className="text-gray-700 leading-relaxed">
                    <MapPin className="inline w-4 h-4 mr-2 text-red-500" /> 
                    {[lead.address, lead.city, lead.state, lead.pincode].filter(Boolean).join(', ') || 'Address not updated'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Internal Remarks</h2>
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-gray-700 min-h-[100px] whitespace-pre-wrap leading-relaxed">
                {lead.notes || 'No notes added for this lead yet.'}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Assignment & Metadata */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Lead Context</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Source</p>
                  <p className="font-bold text-gray-900 text-lg capitalize">{lead.source}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Campaign</p>
                  <p className="font-bold text-gray-900">{lead.campaign_name || lead.source_campaign || 'Organic'}</p>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Assigned To</p>
                  {lead.assigned_team_member ? (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-black">
                        {lead.assigned_team_member.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{lead.assigned_team_member.name}</p>
                        <p className="text-gray-500 text-xs">{lead.assigned_team_member.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 text-sm font-bold">
                      <UserPlus size={18} /> Unassigned
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100">
                <Quote className="w-8 h-8 opacity-20 mb-4" />
                <p className="text-sm opacity-80 leading-relaxed italic">
                   "Manage this lead actively to increase conversion rates. High-priority leads should be contacted within 2 hours."
                </p>
                <div className="mt-6 flex items-center justify-between">
                   <div className="text-xs font-bold uppercase tracking-tighter opacity-60">CRM Insights</div>
                   <ArrowRight size={16} />
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {showEditModal && (
        <EditLeadModal 
          lead={lead} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={() => {
            setShowEditModal(false);
            fetchLead();
          }} 
        />
      )}
    </div>
  );
}

// --- Edit Modal Component ---
function EditLeadModal({ lead, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: lead.full_name,
    phone: lead.phone,
    email: lead.email || '',
    status: lead.status,
    assigned_to: lead.assigned_to || '',
    priority: lead.priority || 0,
    address: lead.address || '',
    city: lead.city || '',
    state: lead.state || '',
    pincode: lead.pincode || '',
    notes: lead.notes || ''
  });

  useEffect(() => {
    fetch('/api/admin/team')
      .then(res => res.json())
      .then(data => setAgents(data.teamMembers?.filter((m: any) => m.is_active) || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) onSuccess();
      else alert('Error updating lead');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-semibold" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
              <input required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-semibold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <div className="col-span-2 p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <label className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-3 ml-1">
                <UserPlus size={14} /> Assigned Representative
              </label>
              <select 
                className="w-full p-4 border-2 border-blue-100 rounded-2xl bg-white outline-none focus:border-blue-500 font-bold text-blue-900"
                value={formData.assigned_to}
                onChange={e => setFormData({...formData, assigned_to: e.target.value})}
              >
                <option value="">Unassigned (Open Queue)</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Lead Status</label>
              <select className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
              <select className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}>
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Notes</label>
            <textarea rows={4} className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-medium" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Add follow-up details..." />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Update Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'new': return 'bg-blue-100 text-blue-700';
    case 'contacted': return 'bg-yellow-100 text-yellow-700';
    case 'qualified': return 'bg-purple-100 text-purple-700';
    case 'converted': return 'bg-green-100 text-green-700';
    case 'lost': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}