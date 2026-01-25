'use client';

// =====================================================
// ASSIGN LEAD MODAL - ASSIGN LEAD TO TEAM MEMBER
// =====================================================

import React, { useState, useEffect } from 'react';
import { X, User, Search, CheckCircle } from 'lucide-react';
import type { Lead, TeamMember } from '@/types';

interface AssignLeadModalProps {
  lead: Lead;
  onClose: () => void;
  onAssign: (assigneeId: string) => void;
}

export default function AssignLeadModal({ lead, onClose, onAssign }: AssignLeadModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(lead.assigned_to || null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/team?active=true&with_stats=true');
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedId) return;
    setIsAssigning(true);
    await onAssign(selectedId);
    setIsAssigning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Assign Lead</h2>
            <p className="text-sm text-gray-500">{lead.full_name || lead.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Team Member List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No team members found
            </div>
          ) : (
            <div className="divide-y">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedId(member.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedId === member.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {member.user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{member.user?.full_name}</p>
                    <p className="text-sm text-gray-500">{member.designation}</p>
                    {member.stats && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{member.stats.leads_assigned_today} leads today</span>
                        <span>•</span>
                        <span>{member.stats.conversion_rate}% conv.</span>
                      </div>
                    )}
                  </div>
                  {selectedId === member.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                  {!member.is_available && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                      Offline
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedId || isAssigning}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isAssigning ? 'Assigning...' : 'Assign Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}