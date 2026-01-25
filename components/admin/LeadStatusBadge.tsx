import React from 'react';
import { LeadStatus } from '@/types/database';
import { cn } from '@/lib/utils/helpers';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-100 text-blue-800' },
  not_picked: { label: 'Not Picked', className: 'bg-gray-100 text-gray-800' },
  follow_up: { label: 'Follow Up', className: 'bg-yellow-100 text-yellow-800' },
  interested: { label: 'Interested', className: 'bg-green-100 text-green-800' },
  order_confirmed: { label: 'Converted', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  wrong_number: { label: 'Wrong Number', className: 'bg-orange-100 text-orange-800' },
  not_interested: { label: 'Not Interested', className: 'bg-gray-100 text-gray-800' },
  callback: { label: 'Callback', className: 'bg-purple-100 text-purple-800' },
};

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

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