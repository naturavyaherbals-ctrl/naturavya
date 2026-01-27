'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, Tag, User, 
  Clock, Edit, X, Save, Loader2, UserPlus, Package, ArrowRight, Quote,
  Sparkles, CheckCircle, Home, AlertCircle, Search
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
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  const fetchLead = async () => {
    if (!leadId) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      const data = await res.json();
      if (data.lead) setLead(data.lead);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: member } = await supabase.from('team_members').select('role').eq('user_id', user.id).single();
        setUserRole(member?.role || 'agent');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [leadId]);

  const handleQuickUpdate = async (updates: any) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) fetchLead();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
    </div>
  );

  if (!lead) return (
    <div className="p-8 text-center text-red-500">
      <p>Lead not found</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 underline font-bold">Go Back</button>
    </div>
  );

  const isAddressMissing = !lead.address || !lead.pincode || !lead.city;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* ALERT: MISSING ADDRESS */}
        {isAddressMissing && (
          <div className="mb-6 bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-red-50">
            <div className="flex items-center gap-4 text-red-700">
               <div className="p-3 bg-red-100 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
               <div>
                  <p className="font-black uppercase tracking-tighter text-sm">Meta Lead: Address Required</p>
                  <p className="font-bold">Shipping address is missing for this lead.</p>
               </div>
            </div>
            <button 
              onClick={() => setShowAddressModal(true)}
              className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95"
            >
              Add Address Now
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
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
                    <span className="text-gray-400 text-sm flex items-center font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      Started {format(new Date(lead.created_at), 'MMM d, p')}
                    </span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => router.push(`/admin/orders/manual?name=${lead.full_name}&phone=${lead.phone}&leadId=${lead.id}`)}
                className="px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 shadow-lg shadow-orange-100 flex items-center gap-2 font-bold transition-all active:scale-95"
              >
                <Package size={18} /> Create Order
              </button>
              <button onClick={() => setShowEditModal(true)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 flex items-center gap-2 font-bold shadow-sm transition-all"><Edit size={18} /> Edit Details</button>
            </div>
        </div>

        {/* Quick Action Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => handleQuickUpdate({ priority: lead.priority === 2 ? 0 : 2 })} 
              className={`p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all ${lead.priority === 2 ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200' : 'bg-white border-red-50 text-red-600 hover:bg-red-50'}`}
            >
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${lead.priority === 2 ? 'bg-red-500' : 'bg-red-50'}`}>
                    <Sparkles className={lead.priority === 2 ? 'text-white' : 'text-red-500'} />
                   </div>
                   <div className="text-left">
                    <p className="text-xs font-black uppercase opacity-60">Priority</p>
                    <p className="text-xl font-bold">Hot Lead</p>
                   </div>
                </div>
                {lead.priority === 2 && <CheckCircle size={24} />}
            </button>
            
            <button 
              onClick={() => handleQuickUpdate({ status: lead.status === 'follow_up' ? 'contacted' : 'follow_up' })} 
              className={`p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all ${lead.status === 'follow_up' ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-200' : 'bg-white border-amber-50 text-amber-600 hover:bg-amber-50'}`}
            >
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${lead.status === 'follow_up' ? 'bg-amber-400' : 'bg-amber-50'}`}>
                    <Clock className={lead.status === 'follow_up' ? 'text-white' : 'text-amber-500'} />
                   </div>
                   <div className="text-left">
                    <p className="text-xs font-black uppercase opacity-60">Workflow</p>
                    <p className="text-xl font-bold">Follow-up</p>
                   </div>
                </div>
                {lead.status === 'follow_up' && <CheckCircle size={24} />}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800"><MapPin className="text-blue-500" /> Shipping Information</h2>
                <button onClick={() => setShowAddressModal(true)} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"><Edit size={14}/> Edit Address</button>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {lead.address || <span className="text-red-400 italic">Address not provided</span>}
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                     <div className="text-sm"><p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">City</p><p className="font-bold text-gray-700">{lead.city || '-'}</p></div>
                     <div className="text-sm"><p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">State</p><p className="font-bold text-gray-700">{lead.state || '-'}</p></div>
                     <div className="text-sm"><p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Pincode</p><p className="font-bold text-gray-700">{lead.pincode || '-'}</p></div>
                  </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Quote size={20} className="text-blue-400" /> Internal Remarks</h2>
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-gray-700 min-h-[100px] whitespace-pre-wrap leading-relaxed">
                {lead.notes || 'No notes added yet for this client.'}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Meta Sidebar */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold mb-6 text-gray-800">Lead Context</h2>
                <div className="space-y-5">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Source channel</p>
                        <p className="font-bold text-gray-900 capitalize">{lead.source}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Campaign</p>
                        <p className="font-bold text-gray-900">{lead.campaign_name || lead.source_campaign || 'None'}</p>
                    </div>
                    <div className="pt-4 border-t">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Assigned Agent</p>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{lead.assigned_team_member?.name?.[0] || 'A'}</div>
                            <p className="text-sm font-bold text-gray-700">{lead.assigned_team_member?.name || 'Unassigned'}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {showAddressModal && (
        <AddressUpdateModal 
          lead={lead} 
          onClose={() => setShowAddressModal(false)} 
          onSuccess={() => { setShowAddressModal(false); fetchLead(); }} 
        />
      )}

      {showEditModal && (
        <EditLeadModal 
          lead={lead} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={() => { setShowEditModal(false); fetchLead(); }} 
        />
      )}
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS & FUNCTIONS
// =====================================================

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'new': return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'contacted': return 'bg-sky-100 text-sky-700 border border-sky-200';
    case 'follow_up': return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'qualified': return 'bg-purple-100 text-purple-700 border border-purple-200';
    case 'converted': 
    case 'interested':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'lost': return 'bg-red-100 text-red-700 border border-red-200';
    default: return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
}

function AddressUpdateModal({ lead, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [formData, setFormData] = useState({
    address: lead.address || '',
    city: lead.city || '',
    state: lead.state || '',
    pincode: lead.pincode || ''
  });

  useEffect(() => {
    if (formData.pincode.length === 6) {
      const lookup = async () => {
        setFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          if (data[0].Status === 'Success') {
            const po = data[0].PostOffice[0];
            setFormData(prev => ({ ...prev, city: po.District, state: po.State }));
          }
        } catch (e) { console.error(e); } finally { setFetchingPincode(false); }
      };
      lookup();
    }
  }, [formData.pincode]);

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
    } catch (err) { alert('Update failed'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Home size={24}/> Address Detail</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <textarea required rows={3} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-semibold transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, building, house no..." />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <input required maxLength={6} className="w-full p-4 bg-blue-50/30 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-blue-900" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g,'')})} placeholder="6-digit PIN" />
              {fetchingPincode && <Loader2 className="absolute right-4 top-4 animate-spin text-blue-600" size={20} />}
            </div>
            <input className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-600" value={formData.city} readOnly placeholder="City" />
            <input className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-600" value={formData.state} readOnly placeholder="State" />
          </div>
          <div className="flex gap-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-gray-400">Cancel</button>
             <button type="submit" disabled={loading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                {loading ? <Loader2 className="animate-spin" /> : <Save />} Save Address
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    notes: lead.notes || ''
  });

  useEffect(() => {
    fetch('/api/admin/team').then(res => res.json()).then(data => setAgents(data.teamMembers?.filter((m: any) => m.is_active) || []));
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold">Edit Lead Info</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required className="w-full p-4 border rounded-2xl bg-gray-50" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            <input required className="w-full p-4 border rounded-2xl bg-gray-50" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <select className="w-full p-4 border rounded-2xl bg-gray-50 col-span-2" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})}>
                <option value="">Select Agent (Unassigned)</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select className="w-full p-4 border rounded-2xl bg-gray-50" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow Up</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
            </select>
            <select className="w-full p-4 border rounded-2xl bg-gray-50" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}>
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High / Hot</option>
            </select>
          </div>
          <textarea rows={4} className="w-full p-4 border rounded-2xl bg-gray-50" placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          <div className="flex gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-4 border rounded-2xl text-gray-500 font-bold">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : <Save />} Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}