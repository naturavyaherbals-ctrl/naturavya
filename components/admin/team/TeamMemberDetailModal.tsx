'use client';

// =====================================================
// TEAM MEMBER DETAIL MODAL
// =====================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Edit2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { TeamMember } from '@/types';
import { formatCurrency } from '@/lib/utils/formatting';

interface TeamMemberDetailModalProps {
  member: TeamMember;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TeamMemberDetailModal({
  member,
  onClose,
  onUpdate,
}: TeamMemberDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    designation: member.designation || '',
    department: member.department || 'Sales',
    daily_lead_limit: member.daily_lead_limit || 50,
    monthly_target: member.monthly_target || 100,
    is_available: member.is_available,
  });

  const handleToggleAvailability = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !member.is_available }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating team member:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    manager: 'bg-green-100 text-green-700',
    agent: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {member.user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                  member.is_available ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{member.user?.full_name}</h2>
                <p className="text-gray-500">{member.designation || 'Team Member'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    roleColors[member.user?.role || 'agent']
                  }`}>
                    {member.user?.role?.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    member.is_available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.is_available ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Performance Stats */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Today's Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox
                label="Leads Assigned"
                value={member.stats?.leads_assigned_today || 0}
                color="blue"
              />
              <StatBox
                label="Converted"
                value={member.stats?.leads_converted_today || 0}
                color="green"
              />
              <StatBox
                label="Conversion Rate"
                value={`${member.stats?.conversion_rate || 0}%`}
                color="purple"
              />
              <StatBox
                label="Pending Follow-ups"
                value={member.stats?.follow_up_pending || 0}
                color="orange"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{member.user?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{member.department || 'Not assigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {member.created_at 
                      ? format(new Date(member.created_at), 'PP') 
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Settings */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Work Settings
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={editForm.designation}
                      onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={editForm.department}
                      onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Support">Support</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Lead Limit
                    </label>
                    <input
                      type="number"
                      value={editForm.daily_lead_limit}
                      onChange={(e) => setEditForm(prev => ({ ...prev, daily_lead_limit: parseInt(e.target.value) }))}
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
                      value={editForm.monthly_target}
                      onChange={(e) => setEditForm(prev => ({ ...prev, monthly_target: parseInt(e.target.value) }))}
                      min={1}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">{member.employee_id || 'Not assigned'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Reports To</p>
                  <p className="font-medium">
                    {member.manager?.user?.full_name || 'No Manager'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Daily Lead Limit</p>
                  <p className="font-medium">{member.daily_lead_limit} leads/day</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Monthly Target</p>
                  <p className="font-medium">{member.monthly_target} conversions</p>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Performance */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              This Month's Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox
                label="Total Leads"
                value={member.stats?.leads_assigned_total || 0}
                color="blue"
              />
              <StatBox
                label="Converted"
                value={member.stats?.leads_converted_total || 0}
                color="green"
              />
              <StatBox
                label="Revenue"
                value={formatCurrency(member.stats?.revenue_total || 0)}
                color="purple"
                isLarge
              />
              <StatBox
                label="Target Achievement"
                value={`${Math.round(((member.stats?.leads_converted_total || 0) / (member.monthly_target || 1)) * 100)}%`}
                color="orange"
              />
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">Monthly Target Progress</span>
                <span className="font-medium">
                  {member.stats?.leads_converted_total || 0} / {member.monthly_target || 0}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(((member.stats?.leads_converted_total || 0) / (member.monthly_target || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Last Activity */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Last Login</span>
              </div>
              <span className="font-medium">
                {member.user?.last_login_at
                  ? formatDistanceToNow(new Date(member.user.last_login_at), { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t flex flex-wrap gap-3 justify-between">
          <div className="flex gap-3">
            <button
              onClick={handleToggleAvailability}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                member.is_available
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {member.is_available ? (
                <>
                  <XCircle className="w-4 h-4" />
                  Set Offline
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Set Online
                </>
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/admin/crm?assigned_to=${member.id}`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              View Leads
            </Link>
            <Link
              href={`/admin/reports?member=${member.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <BarChart3 className="w-4 h-4" />
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STAT BOX COMPONENT
// =====================================================

function StatBox({
  label,
  value,
  color,
  isLarge,
}: {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isLarge?: boolean;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <p className={`font-bold ${isLarge ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}