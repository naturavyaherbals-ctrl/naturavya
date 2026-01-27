'use client';

import { Order, OrderStatus } from '@/types/order';
import { getStatusDisplayInfo, STATUS_CONFIG } from '@/types/status';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { 
  ChevronRight, 
  Phone, 
  MapPin, 
  Package, 
  AlertTriangle,
  RotateCcw 
} from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  onStatusUpdate: (order: Order) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function OrderList({
  orders,
  isLoading,
  onStatusUpdate,
  pagination,
  onPageChange,
}: OrderListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 border-b animate-pulse flex items-center space-x-4"
          >
            <div className="h-12 w-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
        <p className="mt-2 text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b hidden md:grid md:grid-cols-6 gap-4 text-sm font-medium text-gray-500">
        <div className="col-span-2">Order Details</div>
        <div>Status</div>
        <div>Delivery Attempts</div>
        <div>Last Updated</div>
        <div>Actions</div>
      </div>

      {/* Order Items */}
      <div className="divide-y">
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} orders
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            {/* Page numbers */}
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 border rounded text-sm ${
                    pagination.page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (order: Order) => void;
}) {
  const statusInfo = getStatusDisplayInfo(order.current_status);
  const isDeliveryAttempt = order.current_status.startsWith('delivery_attempt');
  const attemptNumber = isDeliveryAttempt
    ? parseInt(order.current_status.split('_')[2])
    : 0;

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="md:grid md:grid-cols-6 gap-4 items-center">
        {/* Order Details */}
        <div className="col-span-2 mb-4 md:mb-0">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full ${statusInfo.bgColor} flex items-center justify-center`}>
                <Package className={`h-5 w-5 ${statusInfo.color}`} />
              </div>
            </div>
            <div className="ml-4">
              <Link
                href={`/admin/orders/${order.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                #{order.order_number}
              </Link>
              <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                <span className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {order.customer_phone}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {order.shipping_address?.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-2 md:mb-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            {order.is_rto && <RotateCcw className="h-3 w-3 mr-1" />}
            {statusInfo.label}
          </span>
        </div>

        {/* Delivery Attempts */}
        <div className="mb-2 md:mb-0">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  order.delivery_attempts_count >= num
                    ? num <= 2
                      ? 'bg-yellow-100 text-yellow-700'
                      : num <= 4
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          {order.delivery_attempts_count > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {order.delivery_attempts_count} attempt{order.delivery_attempts_count > 1 ? 's' : ''} made
            </p>
          )}
        </div>

        {/* Last Updated */}
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-600">
            {formatDistanceToNow(new Date(order.status_updated_at), { addSuffix: true })}
          </p>
          <p className="text-xs text-gray-400">
            {format(new Date(order.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStatusUpdate(order)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Status
          </button>
          <Link
            href={`/admin/orders/${order.id}`}
            className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Warning for high delivery attempts */}
      {order.delivery_attempts_count >= 3 && !order.is_rto && (
        <div className="mt-3 flex items-center text-sm text-orange-600 bg-orange-50 rounded-md px-3 py-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {order.delivery_attempts_count === 5
            ? 'Maximum delivery attempts reached. Consider initiating RTO.'
            : `${5 - order.delivery_attempts_count} delivery attempts remaining`}
        </div>
      )}
    </div>
  );
}