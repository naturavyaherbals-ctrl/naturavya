'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Loader2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface TeamMember {
  id: string;
  name?: string; 
  full_name?: string; 
  email: string;
  phone?: string;
  role: string;
  department?: string;
  daily_lead_capacity?: number;
  is_active?: boolean;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      setMembers(data.teamMembers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const res = await fetch(`/api/admin/team?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(members.filter(m => m.id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      alert('Error deleting member');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <div className="flex gap-2">
          <button onClick={fetchMembers} className="p-2 bg-white border rounded hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{member.name || member.full_name || 'Unknown'}</h3>
                  <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                    member.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(member)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-gray-600 text-sm">{member.email}</p>
                <p className="text-gray-600 text-sm">{member.phone || 'No phone'}</p>
              </div>
              <div className="border-t pt-4 flex justify-between text-sm items-center">
                <span className="text-gray-500">Capacity: <span className="font-medium text-gray-900">{member.daily_lead_capacity || 50}</span></span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <MemberModal 
          member={editingMember} 
          onClose={closeModal} 
          onSuccess={() => { closeModal(); fetchMembers(); }} 
        />
      )}
    </div>
  );
}

function MemberModal({ member, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: member?.name || member?.full_name || '',
    email: member?.email || '',
    password: '', // Password field
    phone: member?.phone || '',
    role: member?.role || 'agent',
    dailyLeadCapacity: member?.daily_lead_capacity || 50,
    isActive: member?.is_active ?? true
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = '/api/admin/team';
      const method = member ? 'PATCH' : 'POST';
      const body = member ? { ...formData, id: member.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Error saving member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">{member ? 'Edit' : 'Add'} Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input 
              placeholder="John Doe" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input 
              placeholder="email@example.com" 
              type="email"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {member ? 'New Password (Optional)' : 'Password *'}
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder={member ? "Leave blank to keep current" : "Min 6 characters"}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none pr-10" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required={!member} // Required only for new members
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {member && <p className="text-xs text-gray-500 mt-1">Only enter if you want to change it.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input 
              placeholder="+91 9999999999" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Daily Capacity</label>
              <input 
                type="number"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.dailyLeadCapacity} 
                onChange={e => setFormData({...formData, dailyLeadCapacity: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
             <input 
              type="checkbox" 
              id="isActive"
              className="w-4 h-4 text-blue-600 rounded"
              checked={formData.isActive} 
              onChange={e => setFormData({...formData, isActive: e.target.checked})} 
            />
            <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Account Active</label>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-2">
            <button type="button" onClick={onClose} className="flex-1 p-2 border rounded hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}