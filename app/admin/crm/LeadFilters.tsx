'use client';

// =====================================================
// LEAD FILTERS - ADVANCED FILTERING PANEL
// =====================================================

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Search, Calendar, User, Filter, RotateCcw } from 'lucide-react';
import type { LeadStatus, LeadSource, TeamMember } from '@/types';
import { LEAD_STATUS_CONFIG } from '@/types';

interface LeadFiltersProps {
  onClose: () => void;
  showAssignmentFilter: boolean;
}

const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'organic', label: 'Organic' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'website', label: 'Website' },
  { value: 'manual', label: 'Manual' },
  { value: 'import', label: 'Import' },
];

const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'not_picked',
  'callback_requested',
  'follow_up',
  'interested',
  'hot_lead',
  'order_confirmed',
  'payment_pending',
  'not_interested',
  'cancelled',
  'wrong_number',
  'duplicate',
  'dnd',
  'converted',
];

export default function LeadFilters({ onClose, showAssignmentFilter }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedStatuses, setSelectedStatuses] = useState<LeadStatus[]>(
    (searchParams.get('status')?.split(',') as LeadStatus[]) || []
  );
  const [selectedSources, setSelectedSources] = useState<LeadSource[]>(
    (searchParams.get('source')?.split(',') as LeadSource[]) || []
  );
  const [assignedTo, setAssignedTo] = useState(searchParams.get('assigned_to') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');

  // Team members for assignment filter
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (showAssignmentFilter) {
      fetchTeamMembers();
    }
  }, [showAssignmentFilter]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/team?active=true');
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const toggleStatus = (status: LeadStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleSource = (source: LeadSource) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedStatuses.length) params.set('status', selectedStatuses.join(','));
    if (selectedSources.length) params.set('source', selectedSources.join(','));
    if (assignedTo) params.set('assigned_to', assignedTo);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (priority) params.set('priority', priority);

    router.push(`/admin/crm?${params.toString()}`);
    onClose();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setSelectedSources([]);
    setAssignedTo('');
    setDateFrom('');
    setDateTo('');
    setPriority('');
    router.push('/admin/crm');
    onClose();
  };

  const hasActiveFilters = 
    search || 
    selectedStatuses.length || 
    selectedSources.length || 
    assignedTo || 
    dateFrom || 
    dateTo || 
    priority;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, phone, email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Assignment Filter */}
        {showAssignmentFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">All Assignments</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to Me</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.user?.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((status) => {
            const config = LEAD_STATUS_CONFIG[status];
            const isSelected = selectedStatuses.includes(status);
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? `${config?.bgColor} ${config?.color} ring-2 ring-offset-1 ring-gray-400`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {config?.label || status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Source Filter */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Source
        </label>
        <div className="flex flex-wrap gap-2">
          {LEAD_SOURCES.map(({ value, label }) => {
            const isSelected = selectedSources.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleSource(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={applyFilters}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}