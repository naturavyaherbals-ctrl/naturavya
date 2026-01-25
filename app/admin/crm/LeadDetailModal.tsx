'use client';

// =====================================================
// LEAD DETAIL MODAL - FULL LEAD VIEW & MANAGEMENT
// =====================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import RoleGuard from '@/components/admin/RoleGuard';
import LeadStatusButtons from './LeadStatusButtons';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Plus,
  Send,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronRight,
  History,
  Activity,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Lead, LeadActivity, LeadStatus, Order } from '@/types';
import { LEAD_STATUS_CONFIG } from '@/types';
import { formatCurrency } from '@/lib/utils/formatting';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

type TabType = 'details' | 'activities' | 'history' | 'orders';

export default function LeadDetailModal({
  lead: initialLead,
  onClose,
  onUpdate,
}: LeadDetailModalProps) {
  const { hasPermission, hasRole } = useAuth();
  const [lead, setLead] = useState<Lead>(initialLead);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [activities, setActivities] = useState<LeadActivity[]>(initialLead.activities || []);
  const [isLoading, setIsLoading] = useState(false);

  // Activity form state
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activityType, setActivityType] = useState<string>('note');

  // Follow-up state
  const [followUpDate, setFollowUpDate] = useState(
    lead.next_follow_up_at 
      ? format(new Date(lead.next_follow_up_at), "yyyy-MM-dd'T'HH:mm") 
      : ''
  );

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: lead.full_name || '',
    phone: lead.phone || '',
    alternate_phone: lead.alternate_phone || '',
    email: lead.email || '',
    city: lead.city || '',
    state: lead.state || '',
    postal_code: lead.postal_code || '',
    address: lead.address || '',
    notes: lead.notes || '',
  });

  // Fetch full lead details
  useEffect(() => {
    fetchLeadDetails();
  }, [lead.id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}`);
      const data = await response.json();
      if (data.success) {
        setLead(data.data);
        setActivities(data.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
    }
  };

  // Handle status change
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus, notes?: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, status_notes: notes }),
      });

      const data = await response.json();
      if (data.success) {
        setLead(prev => ({ ...prev, status: newStatus }));
        fetchLeadDetails(); // Refresh activities
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Add activity
  const handleAddActivity = async (type: string = activityType) => {
    if (!newNote.trim() && type === 'note') return;

    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: type,
          description: newNote || `${type} activity logged`,
          notes: newNote,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setActivities(prev => [data.data, ...prev]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Set follow-up
  const handleSetFollowUp = async () => {
    if (!followUpDate) return;

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          next_follow_up_at: new Date(followUpDate).toISOString(),
          status: lead.status === 'new' ? 'follow_up' : lead.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setLead(data.data);
        onUpdate(data.data);
      }
    } catch (error) {
      console.error('Error setting follow-up:', error);
    }
  };

  // Update lead details
  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.success) {
        setLead(data.data);
        setIsEditing(false);
        onUpdate(data.data);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert to order
  const handleConvertToOrder = () => {
    window.location.href = `/admin/orders/new?lead_id=${lead.id}&phone=${lead.phone}&name=${encodeURIComponent(lead.full_name || '')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b bg-gray-50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">
                  {lead.full_name || 'Unknown Lead'}
                </h2>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  LEAD_STATUS_CONFIG[lead.status]?.bgColor
                } ${LEAD_STATUS_CONFIG[lead.status]?.color}`}>
                  {LEAD_STATUS_CONFIG[lead.status]?.label || lead.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</span>
                {lead.campaign_name && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{lead.campaign_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="p-4 border-b bg-white flex flex-wrap gap-2">
          {/* Call Button */}
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
              `Hi ${lead.full_name || ''}, this is regarding your inquiry at Naturavya Herbals.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>

          {/* Email Button */}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          )}

          {/* Create Order Button */}
          <RoleGuard permission="create_order">
            <button
              onClick={handleConvertToOrder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ml-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              Create Order
            </button>
          </RoleGuard>

          {/* Edit Button */}
          <RoleGuard permission="edit_lead">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </RoleGuard>
        </div>

        {/* Tabs */}
        <div className="border-b bg-white">
          <div className="flex gap-1 px-4 overflow-x-auto">
            {(['details', 'activities', 'history', 'orders'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'details' && 'Details'}
                {tab === 'activities' && `Activities (${activities.length})`}
                {tab === 'history' && 'History'}
                {tab === 'orders' && `Orders (${lead.orders?.length || 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Information
                  </h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Alternate Phone</label>
                        <input
                          type="tel"
                          value={editForm.alternate_phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, alternate_phone: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{lead.phone}</span>
                      </div>
                      {lead.alternate_phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{lead.alternate_phone} (Alt)</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{lead.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Address</label>
                        <textarea
                          value={editForm.address}
                          onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">City</label>
                          <input
                            type="text"
                            value={editForm.city}
                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">State</label>
                          <input
                            type="text"
                            value={editForm.state}
                            onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={editForm.postal_code}
                          onChange={(e) => setEditForm(prev => ({ ...prev, postal_code: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      {lead.address && <p>{lead.address}</p>}
                      <p>
                        {[lead.city, lead.state, lead.postal_code].filter(Boolean).join(', ') || 'No location info'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Button when editing */}
                {isEditing && (
                  <button
                    onClick={handleSaveEdit}
                    disabled={isLoading}
                    className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Status Change */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
                  <LeadStatusButtons
                    leadId={lead.id}
                    currentStatus={lead.status}
                    onStatusChange={handleStatusChange}
                    showAll
                  />
                </div>

                {/* Follow-up Scheduler */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Follow-up
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSetFollowUp}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Set
                    </button>
                  </div>
                  {lead.next_follow_up_at && (
                    <p className="text-sm text-orange-600 mt-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Scheduled: {format(new Date(lead.next_follow_up_at), 'PPp')}
                    </p>
                  )}
                </div>

                {/* Lead Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Lead Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{lead.call_count || 0}</p>
                      <p className="text-sm text-gray-500">Calls Made</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{lead.follow_up_count || 0}</p>
                      <p className="text-sm text-gray-500">Follow-ups</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {lead.last_contacted_at 
                          ? formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })
                          : 'Never'
                        }
                      </p>
                      <p className="text-sm text-gray-500">Last Contact</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {lead.is_converted ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-gray-500">Converted</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Add notes about this lead..."
                    />
                  ) : (
                    <p className="text-gray-600">
                      {lead.notes || 'No notes added yet.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {/* Add Activity Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-2 mb-3">
                  {['note', 'call', 'whatsapp', 'email'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActivityType(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activityType === type
                          ? 'bg-primary text-white'
                          : 'bg-white border hover:bg-gray-100'
                      }`}
                    >
                      {type === 'note' && '📝 Note'}
                      {type === 'call' && '📞 Call'}
                      {type === 'whatsapp' && '💬 WhatsApp'}
                      {type === 'email' && '📧 Email'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={`Add a ${activityType}...`}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                  />
                  <button
                    onClick={() => handleAddActivity()}
                    disabled={isAddingNote}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No activities recorded yet.</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {(!lead.status_history || lead.status_history.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No status changes recorded.</p>
                </div>
              ) : (
                lead.status_history.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      LEAD_STATUS_CONFIG[history.new_status]?.bgColor || 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {history.old_status && (
                          <>
                            <span className="text-gray-500 capitalize">
                              {history.old_status.replace('_', ' ')}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </>
                        )}
                        <span className={`font-medium capitalize ${
                          LEAD_STATUS_CONFIG[history.new_status]?.color || 'text-gray-700'
                        }`}>
                          {history.new_status.replace('_', ' ')}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{formatDistanceToNow(new Date(history.created_at), { addSuffix: true })}</span>
                        {history.created_by_user && (
                          <>
                            <span>•</span>
                            <span>by {history.created_by_user.full_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {(!lead.orders || lead.orders.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No orders from this lead yet.</p>
                  <button
                    onClick={handleConvertToOrder}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Create Order
                  </button>
                </div>
              ) : (
                lead.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.created_at), 'PPp')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ACTIVITY CARD
// =====================================================

function ActivityCard({ activity }: { activity: LeadActivity }) {
  const iconMap: Record<string, React.ReactNode> = {
    call: <Phone className="w-4 h-4 text-green-600" />,
    whatsapp: <MessageCircle className="w-4 h-4 text-green-600" />,
    email: <Mail className="w-4 h-4 text-blue-600" />,
    note: <FileText className="w-4 h-4 text-gray-600" />,
    status_change: <Activity className="w-4 h-4 text-purple-600" />,
    assignment: <User className="w-4 h-4 text-orange-600" />,
    follow_up_scheduled: <Calendar className="w-4 h-4 text-orange-600" />,
    order_created: <ShoppingCart className="w-4 h-4 text-green-600" />,
  };

  const bgMap: Record<string, string> = {
    call: 'bg-green-100',
    whatsapp: 'bg-green-100',
    email: 'bg-blue-100',
    note: 'bg-gray-100',
    status_change: 'bg-purple-100',
    assignment: 'bg-orange-100',
    follow_up_scheduled: 'bg-orange-100',
    order_created: 'bg-green-100',
  };

  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        bgMap[activity.activity_type] || 'bg-gray-100'
      }`}>
        {iconMap[activity.activity_type] || <Activity className="w-4 h-4 text-gray-500" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 capitalize">
            {activity.activity_type.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </span>
        </div>
        {activity.description && (
          <p className="text-gray-600 mt-1">{activity.description}</p>
        )}
        {activity.outcome && (
          <p className="text-sm text-gray-500 mt-1">Outcome: {activity.outcome}</p>
        )}
        {activity.created_by_user && (
          <p className="text-xs text-gray-400 mt-2">
            by {activity.created_by_user.full_name}
          </p>
        )}
      </div>
    </div>
  );
}