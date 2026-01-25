import { RealtimeChannel } from '@supabase/supabase-js';
import { getClient } from './client';

type SubscriptionCallback<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}) => void;

export function subscribeToTable<T>(
  table: string,
  callback: SubscriptionCallback<T>,
  filter?: string
): RealtimeChannel {
  const client = getClient();
  
  let channel = client.channel(`${table}-changes`);
  
  const config: any = {
    event: '*',
    schema: 'public',
    table: table,
  };
  
  if (filter) {
    config.filter = filter;
  }
  
  channel = channel.on('postgres_changes', config, (payload) => {
    callback({
      eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
      new: payload.new as T,
      old: payload.old as T,
    });
  });
  
  channel.subscribe();
  
  return channel;
}

export function subscribeToOrders(callback: SubscriptionCallback<any>) {
  return subscribeToTable('orders', callback);
}

export function subscribeToLeads(
  callback: SubscriptionCallback<any>,
  teamMemberId?: string
) {
  const filter = teamMemberId ? `assigned_to=eq.${teamMemberId}` : undefined;
  return subscribeToTable('leads', callback, filter);
}

export function subscribeToInventory(callback: SubscriptionCallback<any>) {
  return subscribeToTable('inventory', callback);
}

export function unsubscribe(channel: RealtimeChannel) {
  const client = getClient();
  client.removeChannel(channel);
}