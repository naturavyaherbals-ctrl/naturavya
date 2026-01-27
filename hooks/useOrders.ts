'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderStatus, Order, OrderWithHistory } from '@/types/order';
import { 
  StatusUpdateRequest, 
  DeliveryAttemptRequest,
  RTOInitiationRequest,
  StatusUpdateResponse,
  DeliveryAttemptResponse 
} from '@/types/status';

interface OrdersFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  isRTO?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Fetch orders with filters
async function fetchOrders(filters: OrdersFilters): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`/api/orders?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

// Fetch single order with history
async function fetchOrderWithHistory(orderId: string): Promise<OrderWithHistory> {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
}

// Update order status
async function updateOrderStatus(
  orderId: string,
  data: StatusUpdateRequest
): Promise<StatusUpdateResponse> {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update status');
  }
  return response.json();
}

// Record delivery attempt
async function recordDeliveryAttempt(
  orderId: string,
  data: DeliveryAttemptRequest
): Promise<DeliveryAttemptResponse> {
  const response = await fetch(`/api/orders/${orderId}/delivery-attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to record delivery attempt');
  }
  return response.json();
}

// Initiate RTO
async function initiateRTO(
  orderId: string,
  data: RTOInitiationRequest
): Promise<{ success: boolean; rto_id: string }> {
  const response = await fetch(`/api/orders/${orderId}/rto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate RTO');
  }
  return response.json();
}

// Custom hooks
export function useOrders(filters: OrdersFilters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchOrders(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderWithHistory(orderId),
    enabled: !!orderId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: StatusUpdateRequest }) =>
      updateOrderStatus(orderId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useRecordDeliveryAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: DeliveryAttemptRequest }) =>
      recordDeliveryAttempt(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useInitiateRTO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: RTOInitiationRequest }) =>
      initiateRTO(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
