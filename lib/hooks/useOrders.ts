'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/types/database';

interface UseOrdersOptions {
  admin?: boolean;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { admin = false, limit = 20, ...filters } = options;

  const fetchOrders = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (admin) params.set('admin', 'true');
      if (filters.status) params.set('status', filters.status);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pageNum.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setTotal(data.total || data.orders.length);
        setTotalPages(data.totalPages || 1);
        setPage(pageNum);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Orders fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [admin, filters, limit]);

  const updateOrderStatus = useCallback(async (
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error('Order status update error:', err);
      return false;
    }
  }, []);

  const updateTracking = useCallback(async (
    orderId: string,
    trackingNumber: string,
    courierName: string,
    trackingUrl?: string,
    estimatedDelivery?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          courierName,
          trackingUrl,
          estimatedDelivery,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  tracking_number: trackingNumber,
                  courier_name: courierName,
                  tracking_url: trackingUrl || order.tracking_url,
                  estimated_delivery: estimatedDelivery || order.estimated_delivery,
                }
              : order
          )
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error('Tracking update error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [filters.status, filters.startDate, filters.endDate, filters.search]);

  return {
    orders,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    updateTracking,
    setPage: (p: number) => fetchOrders(p),
    refresh: () => fetchOrders(page),
  };
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order');
      console.error('Order fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  return { order, isLoading, error, refresh: fetchOrder };
}