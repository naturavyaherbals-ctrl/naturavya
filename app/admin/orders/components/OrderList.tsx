'use client';

import { Order } from '@/types/order';
import { getStatusDisplayInfo } from '@/types/status';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import {
  ChevronRight,
  Phone,
  MapPin,
  Package,
  AlertTriangle,
  RotateCcw,
  User,
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-6 border-b border-gray-50 animate-pulse flex items-center space-x-4"
          >
            <div className="h-12 w-12 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-8 w-24 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No matching orders</h3>
        <p className="mt-2 text-gray-500 max-w-xs mx-auto">
          We couldn&apos;t find any orders matching your current filters or
          assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 hidden md:grid md:grid-cols-7 gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <div className="col-span-2">Order Details</div>
        <div>Status</div>
        <div>Attempts</div>
        <div>Handled By</div>
        <div>Last Updated</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Order Items */}
      <div className="divide-y divide-gray-50">
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
        <div className="px-6 py-5 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Showing{' '}
            <span className="text-gray-900">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="text-gray-900">
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}
            </span>{' '}
            of{' '}
            <span className="text-gray-900">{pagination.total}</span> orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-gray-300 transition-all shadow-sm"
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
  order: any;
  onStatusUpdate: (order: Order) => void;
}) {
  const currentStatus = order.current_status || order.status || 'pending';
  const statusInfo = getStatusDisplayInfo(currentStatus);

  // Safe calculation for "Last Updated"
  const updatedRaw =
    order.status_updated_at || order.updated_at || order.created_at;
  let updatedRelative = '—';
  if (updatedRaw) {
    const d = new Date(updatedRaw);
    if (!isNaN(d.getTime())) {
      updatedRelative = formatDistanceToNow(d, { addSuffix: true });
    }
  }

  let createdLabel = '—';
  if (order.created_at) {
    const c = new Date(order.created_at);
    if (!isNaN(c.getTime())) {
      createdLabel = format(c, 'MMM d, yyyy');
    }
  }

  return (
    <div className="px-6 py-5 hover:bg-blue-50/30 transition-all group">
      <div className="md:grid md:grid-cols-7 gap-4 items-center">
        {/* Order Details */}
        <div className="col-span-2 mb-4 md:mb-0">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-2xl ${statusInfo.bgColor} flex items-center justify-center shadow-sm`}
              >
                <Package className={`h-6 w-6 ${statusInfo.color}`} />
              </div>
            </div>
            <div className="ml-4">
              <Link
                href={`/admin/orders/${order.id}`}
                className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                #{order.order_number}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </Link>
              <p className="text-xs font-medium text-gray-500 mt-1">
                {order.customer_name}
              </p>
              <div className="flex items-center text-[10px] font-bold text-gray-400 mt-1.5 space-x-3 uppercase tracking-tighter">
                <span className="flex items-center">
                  <Phone className="h-3 w-3 mr-1 text-green-500" />
                  {order.customer_phone}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-red-500" />
                  {order.shipping_address?.city ||
                    order.shipping_city ||
                    'No City'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-2 md:mb-0">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.bgColor} ${statusInfo.color} border border-current opacity-80`}
          >
            {order.is_rto && <RotateCcw className="h-2.5 w-2.5 mr-1" />}
            {statusInfo.label}
          </span>
        </div>

        {/* Delivery Attempts */}
        <div className="mb-2 md:mb-0">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  (order.delivery_attempts_count || 0) >= num
                    ? 'bg-orange-100 text-orange-600 border border-orange-200'
                    : 'bg-gray-50 text-gray-300 border border-gray-100'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Handled By Agent */}
        <div className="mb-2 md:mb-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {order.assigned_team_member?.name ||
                  order.agent_name ||
                  'Self / Website'}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                Representative
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-4 md:mb-0">
          <p className="text-xs font-bold text-gray-700">
            {updatedRelative}
          </p>
          <p className="text-[10px] font-medium text-gray-400 mt-0.5">
            {createdLabel}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onStatusUpdate(order)}
            className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-black text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
          >
            UPDATE
          </button>
        </div>
      </div>

      {/* Warning for high delivery attempts */}
      {order.delivery_attempts_count >= 3 && !order.is_rto && (
        <div className="mt-4 flex items-center text-[11px] font-bold text-orange-700 bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-2.5">
          <AlertTriangle className="h-3.5 w-3.5 mr-2" />
          {order.delivery_attempts_count === 5
            ? 'CRITICAL: Maximum delivery attempts reached. RTO recommended.'
            : `ACTION REQUIRED: ${
                5 - order.delivery_attempts_count
              } attempts remaining.`}
        </div>
      )}
    </div>
  );
}