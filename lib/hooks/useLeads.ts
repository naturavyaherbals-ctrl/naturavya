'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Lead, LeadStatus, LeadSource } from '@/types/database';

interface UseLeadsOptions {
  status?: LeadStatus;
  assignedTo?: string;      // camelCase (old usage)
  assigned_to?: string;     // snake_case (current usage in pages)
  source?: LeadSource;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;

  // AI scoring related
  temperature?: string;     // 'hot' | 'warm' | 'cold' | etc.
  minScore?: number;
  maxScore?: number;
  sort?: string;            // 'created_desc' | 'created_asc' | 'score_desc' | 'score_asc' | 'priority_desc' | 'priority_asc'
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

  const fetchLeads = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        const filters = filterRef.current as UseLeadsOptions;

        if (filters.status) params.set('status', filters.status);

        // Support both assignedTo and assigned_to, but always send assigned_to to API
        const assignedFilter = filters.assigned_to ?? filters.assignedTo;
        if (assignedFilter) params.set('assigned_to', assignedFilter);

        if (filters.source) params.set('source', filters.source);
        if (filters.search) params.set('search', filters.search);

        if (filters.temperature) params.set('temperature', filters.temperature);

        if (typeof filters.minScore === 'number')
          params.set('min_score', String(filters.minScore));
        if (typeof filters.maxScore === 'number')
          params.set('max_score', String(filters.maxScore));

        if (filters.sort) params.set('sort', filters.sort);

        params.set('page', pageNum.toString());
        params.set('limit', limit.toString());

        const response = await fetch(`/api/admin/leads?${params.toString()}`);

        if (!response.ok) {
          const errText = await response.text();
          console.error('API Error Response:', errText);
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setLeads(data.data || []);
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
    },
    [limit]
  );

  // Trigger fetch when important filters change
  useEffect(() => {
    fetchLeads(1);
  }, [
    options.status,
    options.assignedTo,
    options.assigned_to,
    options.search,
    options.source,
    options.temperature,
    options.minScore,
    options.maxScore,
    options.sort,
    fetchLeads,
  ]);

  const updateLeadStatus = useCallback(
    async (leadId: string, status: LeadStatus, notes?: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/leads/${leadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_status', status, notes }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (data.success) {
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, status } : l))
          );
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
  []);

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