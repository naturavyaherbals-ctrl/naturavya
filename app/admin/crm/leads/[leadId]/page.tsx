'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, Tag, User, 
  Clock, Edit, X, Save, Loader2, UserPlus, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.leadId as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch lead data
  const fetchLead = async () => {
    if (!leadId) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      const data = await res.json();
      if (data.lead) setLead(data.lead);
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Leads
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.full_name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
              <span className="text-gray-500 text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Created {format(new Date(lead.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
          >
            <Edit className="w-4 h-4" /> Edit Lead
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Contact & Interests */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <User className="w-5 h-5 text-blue-500" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Primary Phone</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" /> {lead.phone}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" /> {lead.email || 'No email provided'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Address Details</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> 
                  {[lead.address, lead.city, lead.state, lead.pincode].filter(Boolean).join(', ') || 'No address provided'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Tag className="w-5 h-5 text-blue-500" /> Lead Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {lead.interested_products?.map((prod: string) => (
                <span key={prod} className="px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium">
                  {prod}
                </span>
              ))}
              {(!lead.interested_products?.length) && (
                <p className="text-gray-400 text-sm italic">No products specified</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Internal Notes</h2>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-sm whitespace-pre-wrap">
              {lead.notes || 'No internal notes added for this lead.'}
            </div>
          </div>
        </div>

        {/* Right Column: Assignment & Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Lead Context</h2>
            <div className="space-y-4">
              <DetailRow label="Source" value={lead.source} />
              <DetailRow label="Campaign" value={lead.campaign_name || lead.source_campaign || 'Direct'} />
              <DetailRow label="Priority" value={lead.priority === 2 ? 'High' : lead.priority === 1 ? 'Medium' : 'Low'} />
              
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Assigned To</p>
                {lead.assigned_team_member ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {lead.assigned_team_member.name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-blue-900 text-sm">{lead.assigned_team_member.name}</p>
                      <p className="text-blue-700 text-xs">{lead.assigned_team_member.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm font-medium">
                    <UserPlus size={16} /> Unassigned
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Clock className="w-5 h-5 text-blue-500" /> History
            </h2>
            <p className="text-sm text-gray-400 italic">Tracking started on {format(new Date(lead.created_at), 'PPP')}</p>
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

// --- Helper Component: Detail Row ---
function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-gray-900 capitalize">{value || 'N/A'}</p>
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
    // Fetch real team members for assignment
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Update Lead Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
              <input required className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Phone</label>
              <input required className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <div className="col-span-2 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <label className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase mb-2 ml-1">
                <UserPlus size={14} /> Assigned Representative
              </label>
              <select 
                className="w-full p-3 border border-blue-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium text-blue-900"
                value={formData.assigned_to}
                onChange={e => setFormData({...formData, assigned_to: e.target.value})}
              >
                <option value="">Select Agent (Unassigned)</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Status</label>
              <select className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Priority</label>
              <select className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}>
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Notes</label>
            <textarea rows={3} className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl hover:bg-gray-100 font-semibold text-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
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