'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { OrderList } from './components/OrderList';
import { OrderFilters } from './components/OrderFilters';
import { StatusUpdateModal } from './components/StatusUpdateModal';
import { OrderStatus, Order } from '@/types/order';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: undefined as OrderStatus | undefined,
    search: '',
    isRTO: undefined as boolean | undefined,
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data, isLoading, error, refetch } = useOrders(filters);

  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusModalClose = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    refetch();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-600">Error loading orders: {error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="ml-auto text-sm text-red-700 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="mt-2 text-gray-600">
              Manage order statuses, track deliveries, and handle returns
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* 👇 THIS IS THE NEW BUTTON YOU NEEDED */}
            <Link
              href="/admin/orders/manual"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Manual Order
            </Link>
          </div>
        </div>

        {/* Filters */}
        <OrderFilters
          filters={filters}
          onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters, page: 1 })}
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Orders"
            value={data?.pagination.total || 0}
            color="blue"
          />
          <StatCard
            label="In Transit"
            value={
              data?.orders.filter((o) => o.current_status === 'in_transit').length || 0
            }
            color="orange"
          />
          <StatCard
            label="Delivery Attempts"
            value={
              data?.orders.filter((o) =>
                o.current_status?.startsWith?.('delivery_attempt')
              ).length || 0
            }
            color="yellow"
          />
          <StatCard
            label="RTO"
            value={data?.orders.filter((o) => o.is_rto).length || 0}
            color="red"
          />
        </div>

        {/* Order List */}
        <OrderList
          orders={data?.orders || []}
          isLoading={isLoading}
          onStatusUpdate={handleStatusUpdate}
          pagination={data?.pagination}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <StatusUpdateModal
            order={selectedOrder}
            isOpen={showStatusModal}
            onClose={handleStatusModalClose}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'orange' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}