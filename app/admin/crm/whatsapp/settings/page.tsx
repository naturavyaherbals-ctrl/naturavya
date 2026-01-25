'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Phone,
  MessageSquare,
  Settings,
  User,
  Check,
  X,
  Zap,
} from 'lucide-react';

interface WhatsAppAccount {
  id: string;
  name: string;
  phone_number: string;
  phone_number_id: string | null;
  is_primary: boolean;
  is_active: boolean;
  is_verified: boolean;
  auto_reply_enabled: boolean;
  auto_reply_message: string | null;
  business_hours_only: boolean;
  business_hours_start: string | null;
  business_hours_end: string | null;
  messages_sent: number;
  messages_received: number;
  assigned_team_member: {
    id: string;
    user: {
      full_name: string;
    };
  } | null;
}

export default function WhatsAppSettingsPage() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WhatsAppAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'templates' | 'quick-replies'>('accounts');

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    webhookVerifyToken: '',
    assignedTo: '',
    isPrimary: false,
    isActive: true,
    autoReplyEnabled: false,
    autoReplyMessage: '',
    businessHoursOnly: false,
    businessHoursStart: '09:00',
    businessHoursEnd: '18:00',
  });

  useEffect(() => {
    fetchAccounts();
    fetchTeamMembers();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/whatsapp/accounts');
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/team');
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.teamMembers);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingAccount
        ? `/api/admin/whatsapp/accounts/${editingAccount.id}`
        : '/api/admin/whatsapp/accounts';

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        setEditingAccount(null);
        resetForm();
        fetchAccounts();
      } else {
        alert(data.error || 'Failed to save account');
      }
    } catch (err) {
      console.error('Account save error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account: WhatsAppAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      phoneNumber: account.phone_number,
      phoneNumberId: account.phone_number_id || '',
      wabaId: '',
      accessToken: '',
      webhookVerifyToken: '',
      assignedTo: account.assigned_team_member?.id || '',
      isPrimary: account.is_primary,
      isActive: account.is_active,
      autoReplyEnabled: account.auto_reply_enabled,
      autoReplyMessage: account.auto_reply_message || '',
      businessHoursOnly: account.business_hours_only,
      businessHoursStart: account.business_hours_start || '09:00',
      businessHoursEnd: account.business_hours_end || '18:00',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this WhatsApp account?')) return;

    try {
      const response = await fetch(`/api/admin/whatsapp/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      phoneNumberId: '',
      wabaId: '',
      accessToken: '',
      webhookVerifyToken: '',
      assignedTo: '',
      isPrimary: false,
      isActive: true,
      autoReplyEnabled: false,
      autoReplyMessage: '',
      businessHoursOnly: false,
      businessHoursStart: '09:00',
      businessHoursEnd: '18:00',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/crm/whatsapp"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Settings</h1>
            <p className="text-gray-600 mt-1">Manage WhatsApp Business accounts and configuration</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'accounts', label: 'Accounts', icon: Phone },
            { id: 'templates', label: 'Templates', icon: Zap },
            { id: 'quick-replies', label: 'Quick Replies', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                resetForm();
                setEditingAccount(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add WhatsApp Account
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No WhatsApp accounts configured</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Add your first account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                    account.is_primary ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{account.name}</p>
                            {account.is_primary && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{account.phone_number}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          account.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-sm text-gray-500">
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Messages Sent</p>
                        <p className="text-lg font-semibold text-gray-900">{account.messages_sent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Messages Received</p>
                        <p className="text-lg font-semibold text-gray-900">{account.messages_received}</p>
                      </div>
                    </div>

                    {account.assigned_team_member && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Assigned to: {account.assigned_team_member.user.full_name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      {account.auto_reply_enabled && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          Auto-reply on
                        </span>
                      )}
                      {account.business_hours_only && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          Business hours only
                        </span>
                      )}
                      {account.is_verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 border-t flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Webhook Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Webhook Configuration</h3>
            <p className="text-blue-800 text-sm mb-4">
              Configure this webhook URL in your Meta Business Suite to receive messages and lead notifications:
            </p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm break-all">
              {process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/meta
            </div>
            <p className="text-blue-700 text-xs mt-2">
              Verify Token: Use the META_WEBHOOK_VERIFY_TOKEN environment variable
            </p>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">
            WhatsApp message templates are managed in your Meta Business Suite. 
            Templates must be approved by Meta before they can be used.
          </p>
          <a
            href="https://business.facebook.com/wa/manage/message-templates/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            Manage Templates in Meta Business Suite
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Quick Replies Tab */}
      {activeTab === 'quick-replies' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">Quick replies management coming soon.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAccount ? 'Edit WhatsApp Account' : 'Add WhatsApp Account'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Sales Team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+91..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number ID (Meta)
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumberId}
                    onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="From Meta Business Suite"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="WhatsApp Business API Access Token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Team Member
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Shared / Super Admin</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.user.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Primary Account</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Auto-Reply Settings</h3>
                  
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.autoReplyEnabled}
                      onChange={(e) => setFormData({ ...formData, autoReplyEnabled: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Enable auto-reply</span>
                  </label>

                  {formData.autoReplyEnabled && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Auto-Reply Message
                        </label>
                        <textarea
                          value={formData.autoReplyMessage}
                          onChange={(e) => setFormData({ ...formData, autoReplyMessage: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Thank you for your message. We'll get back to you soon!"
                        />
                      </div>

                      <label className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={formData.businessHoursOnly}
                          onChange={(e) => setFormData({ ...formData, businessHoursOnly: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Only during business hours</span>
                      </label>

                      {formData.businessHoursOnly && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={formData.businessHoursStart}
                              onChange={(e) => setFormData({ ...formData, businessHoursStart: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={formData.businessHoursEnd}
                              onChange={(e) => setFormData({ ...formData, businessHoursEnd: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAccount(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingAccount ? 'Update' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}