import React from 'react';
import { OrderStatus } from '@/types/database';
import { cn } from '@/lib/utils/helpers';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  returned: { label: 'Returned', className: 'bg-orange-100 text-orange-800' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800' },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
