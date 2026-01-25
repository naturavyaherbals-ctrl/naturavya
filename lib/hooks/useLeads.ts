'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, LeadSource } from '@/types/database';

interface UseLeadsOptions {
  status?: LeadStatus;
  assignedTo?: string;
  source?: LeadSource;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { limit = 20, ...filters } = options;

  const fetchLeads = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.set('status', filters.status);
      if (filters.assignedTo) params.set('assignedTo', filters.assignedTo);
      if (filters.source) params.set('source', filters.source);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pageNum.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/leads?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.leads);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(pageNum);
      } else {
        setError(data.error || 'Failed to fetch leads');
      }
    } catch (err) {
      setError('Failed to fetch leads');
      console.error('Leads fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit]);

  const updateLeadStatus = useCallback(async (
    leadId: string,
    status: LeadStatus,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', status, notes }),
      });

      const data = await response.json();

      if (data.success) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? { ...lead, status } : lead
          )
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error('Lead status update error:', err);
      return false;
    }
  }, []);

  const assignLead = useCallback(async (
    leadId: string,
    teamMemberId: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', teamMemberId, reason }),
      });

      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Lead assignment error:', err);
      return false;
    }
  }, []);

  const logCall = useCallback(async (
    leadId: string,
    outcome: string,
    notes?: string,
    duration?: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'log_call', outcome, notes, duration }),
      });

      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Log call error:', err);
      return false;
    }
  }, []);

  const scheduleFollowUp = useCallback(async (
    leadId: string,
    scheduledAt: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule_follow_up', scheduledAt, notes }),
      });

      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Schedule follow-up error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchLeads(1);
  }, [filters.status, filters.assignedTo, filters.source, filters.startDate, filters.endDate, filters.search]);

  return {
    leads,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchLeads,
    updateLeadStatus,
    assignLead,
    logCall,
    scheduleFollowUp,
    setPage: (p: number) => fetchLeads(p),
    refresh: () => fetchLeads(page),
  };
}

export function useLead(leadId: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leads/${leadId}`);
      const data = await response.json();

      if (data.success) {
        setLead(data.lead);
      } else {
        setError(data.error || 'Lead not found');
      }
    } catch (err) {
      setError('Failed to fetch lead');
      console.error('Lead fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) {
      fetchLead();
    }
  }, [leadId, fetchLead]);

  return { lead, isLoading, error, refresh: fetchLead };
}