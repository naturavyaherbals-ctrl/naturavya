'use client';

import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase/client';

interface UseRealtimeOptions<T> {
  table: string;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { new: T; old: T }) => void;
  onDelete?: (payload: T) => void;
  enabled?: boolean;
}

export function useRealtime<T = any>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  // We call getClient() inside the hook
  const supabase = getClient();

  const subscribe = useCallback(() => {
    if (!enabled || !supabase) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `${table}-${filter || 'all'}-${Date.now()}`;
    
    let channel = supabase.channel(channelName);

    const config: any = {
      event: '*',
      schema: 'public',
      table,
    };

    if (filter) {
      config.filter = filter;
    }

    channel = channel.on('postgres_changes', config, (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload.new as T);
          break;
        case 'UPDATE':
          onUpdate?.({ new: payload.new as T, old: payload.old as T });
          break;
        case 'DELETE':
          onDelete?.(payload.old as T);
          break;
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${table} changes`);
      }
    });

    channelRef.current = channel;
  }, [table, filter, onInsert, onUpdate, onDelete, enabled, supabase]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [supabase]);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  return { unsubscribe, resubscribe: subscribe };
}

// Specialized hooks for common use cases
export function useRealtimeOrders(callbacks: {
  onNewOrder?: (order: any) => void;
  onOrderUpdate?: (payload: { new: any; old: any }) => void;
} = {}) {
  return useRealtime({
    table: 'orders',
    onInsert: callbacks.onNewOrder,
    onUpdate: callbacks.onOrderUpdate,
  });
}

export function useRealtimeLeads(
  teamMemberId?: string,
  callbacks: {
    onNewLead?: (lead: any) => void;
    onLeadUpdate?: (payload: { new: any; old: any }) => void;
  } = {}
) {
  return useRealtime({
    table: 'leads',
    filter: teamMemberId ? `assigned_to=eq.${teamMemberId}` : undefined,
    onInsert: callbacks.onNewLead,
    onUpdate: callbacks.onLeadUpdate,
  });
}

export function useRealtimeInventory(callbacks: {
  onInventoryUpdate?: (payload: { new: any; old: any }) => void;
} = {}) {
  return useRealtime({
    table: 'inventory',
    onUpdate: callbacks.onInventoryUpdate,
  });
}