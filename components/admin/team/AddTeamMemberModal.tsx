'use client';

// =====================================================
// ADD TEAM MEMBER MODAL
// =====================================================

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building, Target } from 'lucide-react';
import type { User as UserType, TeamMember, UserRole } from '@/types';

interface AddTeamMemberModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTeamMemberModal({ onClose, onSuccess }: AddTeamMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [createNewUser, setCreateNewUser] = useState(false);

  const [formData, setFormData] = useState({
    // Existing user
    user_id: '',
    
    // New user
    email: '',
    full_name: '',
    password: '',
    role: 'agent' as UserRole,
    
    // Team member details
    employee_id: '',
    department: 'Sales',
    designation: '',
    reporting_to: '',
    daily_lead_limit: 50,
    monthly_target: 100,
  });

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users without team member records
      const response = await fetch('/api/admin/users?without_team=true');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/admin/team?role=manager,admin');
      const data = await response.json();
      if (data.success) {
        setManagers(data.data);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let userId = formData.user_id;

      // If creating new user
      if (createNewUser) {
        if (!formData.email || !formData.full_name || !formData.password) {
          setError('Please fill in all required fields for new user');
          setIsSubmitting(false);
          return;
        }

        // Create user first
        const userResponse = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            full_name: formData.full_name,
            password: formData.password,
            role: formData.role,
          }),
        });

        const userData = await userResponse.json();
        if (!userData.success) {
          setError(userData.error || 'Failed to create user');
          setIsSubmitting(false);
          return;
        }

        userId = userData.data.id;
      }

      if (!userId) {
        setError('Please select a user or create a new one');
        setIsSubmitting(false);
        return;
      }

      // Create team member
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          employee_id: formData.employee_id,
          department: formData.department,
          designation: formData.designation,
          reporting_to: formData.reporting_to || null,
          daily_lead_limit: formData.daily_lead_limit,
          monthly_target: formData.monthly_target,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to create team member');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* User Selection Toggle */}
          <div className="mb-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCreateNewUser(false)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  !createNewUser
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">Existing User</p>
              </button>
              <button
                type="button"
                onClick={() => setCreateNewUser(true)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  createNewUser
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">New User</p>
              </button>
            </div>
          </div>

          {/* Existing User Selection */}
          {!createNewUser && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User *
              </label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required={!createNewUser}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No available users. Create a new user instead.
                </p>
              )}
            </div>
          )}

          {/* New User Form */}
          {createNewUser && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required={createNewUser}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={createNewUser}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={createNewUser}
                  minLength={6}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="agent">Sales Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          {/* Team Member Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Team Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="EMP001"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Sales Executive"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reports To
              </label>
              <select
                name="reporting_to"
                value={formData.reporting_to}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">No Manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.user?.full_name} ({manager.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Lead Limit
                </label>
                <input
                  type="number"
                  name="daily_lead_limit"
                  value={formData.daily_lead_limit}
                  onChange={handleChange}
                  min={1}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Target
                </label>
                <input
                  type="number"
                  name="monthly_target"
                  value={formData.monthly_target}
                  onChange={handleChange}
                  min={1}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Add Team Member'}
          </button>
        </div>
      </div>
    </div>
  );
}