'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Phone,
  Mail,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Target,
  BarChart3,
  X,
  Loader2
} from 'lucide-react';

interface TeamMember {
  id: string;
  employee_id: string | null;
  department: string | null;
  designation: string | null;
  daily_lead_capacity: number;
  is_available: boolean;
  user: {
    id: string;
    email: string;
    phone: string | null;
    full_name: string;
    role: string;
    is_active: boolean;
  };
  stats: {
    leadsAssigned: number;
    leadsContacted: number;
    leadsConverted: number;
    conversionRate: number;
    totalCalls: number;
  };
}

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'agent',
    employeeId: '',
    department: '',
    designation: '',
    dailyLeadCapacity: 50,
    isAvailable: true,
    tempPassword: '',
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/team');
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.teamMembers || []);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const url = editingMember
        ? `/api/admin/team/${editingMember.id}`
        : '/api/admin/team';
      
      const response = await fetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        setEditingMember(null);
        resetForm();
        fetchTeamMembers();
      } else {
        setError(data.error || 'Failed to save team member');
      }
    } catch (err) {
      console.error('Team member save error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member? Their leads will be unassigned.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/team/${memberId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchTeamMembers();
      } else {
        alert(data.error || 'Failed to delete team member');
      }
    } catch (err) {
      console.error('Team member delete error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      email: member.user.email,
      fullName: member.user.full_name,
      phone: member.user.phone || '',
      role: member.user.role,
      employeeId: member.employee_id || '',
      department: member.department || '',
      designation: member.designation || '',
      dailyLeadCapacity: member.daily_lead_capacity,
      isAvailable: member.is_available,
      tempPassword: '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      phone: '',
      role: 'agent',
      employeeId: '',
      department: '',
      designation: '',
      dailyLeadCapacity: 50,
      isAvailable: true,
      tempPassword: '',
    });
  };

  const toggleAvailability = async (member: TeamMember) => {
    try {
      await fetch(`/api/admin/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !member.is_available }),
      });
      fetchTeamMembers();
    } catch (err) {
      console.error('Toggle availability error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your sales and support team</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingMember(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Team Members</h2>
        </div>
        
        {teamMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No team members yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Add your first team member
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                      {member.user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{member.user.full_name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${member.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {member.is_available ? 'Available' : 'Unavailable'}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                          {member.user.role.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.user.email}</span>
                        {member.user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.user.phone}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleAvailability(member)} className="px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      {member.is_available ? 'Set Unavailable' : 'Set Available'}
                    </button>
                    <button onClick={() => handleEdit(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!editingMember}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {!editingMember && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                    <input
                      type="text"
                      name="tempPassword"
                      value={formData.tempPassword}
                      onChange={handleChange}
                      placeholder="Leave empty for auto-generated"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingMember ? 'Update' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}