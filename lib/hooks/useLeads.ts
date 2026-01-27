'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Prevent infinite loops by using a ref for filters
  const filterRef = useRef(options);
  useEffect(() => {
    filterRef.current = options;
  }, [options]);

  const { limit = 20 } = options;

  const fetchLeads = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const filters = filterRef.current;
      
      if (filters.status) params.set('status', filters.status);
      if (filters.assignedTo) params.set('assigned_to', filters.assignedTo); // API uses assigned_to
      if (filters.source) params.set('source', filters.source);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pageNum.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/admin/leads?${params.toString()}`);
      
      // 👇 1. SAFETY CHECK: If response is not OK, don't try to parse JSON
      if (!response.ok) {
        const errText = await response.text();
        console.error("API Error Response:", errText);
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();

      // 👇 2. PROPERTY MAPPING: Aligning with the API response structure
      if (data.success) {
        // The API sends 'data', the hook uses 'leads'
        setLeads(data.data || []); 
        // The API sends 'pagination.total'
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.total_pages || 0);
        setPage(pageNum);
      } else {
        setError(data.error || 'Failed to fetch leads');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
      console.error('Leads fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]); // Only depend on limit

  // Trigger fetch when important filters change
  useEffect(() => {
    fetchLeads(1);
  }, [
    options.status, 
    options.assignedTo, 
    options.search, 
    options.source, 
    fetchLeads
  ]);

  // Rest of the helper functions (updateStatus, assignLead, etc.)
  const updateLeadStatus = useCallback(async (
    leadId: string,
    status: LeadStatus,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', status, notes }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      if (data.success) {
        setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  return {
    leads,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchLeads,
    updateLeadStatus,
    setPage: (p: number) => fetchLeads(p),
    refresh: () => fetchLeads(page),
  };
}

// ... useLead helper remains similar but add response.ok check ...