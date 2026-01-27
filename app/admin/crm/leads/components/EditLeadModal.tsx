'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save, UserPlus } from 'lucide-react';

export default function EditLeadModal({ lead, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: lead.full_name || '',
    phone: lead.phone || '',
    email: lead.email || '',
    status: lead.status || 'new',
    assigned_to: lead.assigned_to || '',
    address: lead.address || '',
    city: lead.city || '',
    state: lead.state || '',
    pincode: lead.pincode || '',
    notes: lead.notes || '',
    priority: lead.priority || 0,
  });

  // Fetch active agents/managers for the assignment dropdown
  useEffect(() => {
    const fetchAgents = async () => {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      if (data.teamMembers) {
        // Only show active agents/managers
        setAgents(data.teamMembers.filter((m: any) => m.is_active));
      }
    };
    fetchAgents();
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
      if (res.ok) {
        onSuccess();
      } else {
        alert('Failed to update lead');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Edit Lead Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input required className="w-full p-2 border rounded-lg" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input required className="w-full p-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            {/* Assignment Dropdown */}
            <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-2">
                <UserPlus size={16} /> Assign to Agent / Manager
              </label>
              <select 
                className="w-full p-2.5 border border-blue-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.assigned_to}
                onChange={e => setFormData({...formData, assigned_to: e.target.value})}
              >
                <option value="">Unassigned</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select className="w-full p-2 border rounded-lg" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}>
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea rows={3} className="w-full p-2 border rounded-lg" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}