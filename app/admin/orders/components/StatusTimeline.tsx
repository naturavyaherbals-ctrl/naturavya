'use client';

import { OrderStatusHistory, DeliveryAttempt } from '@/types/order';
import { getStatusDisplayInfo, DELIVERY_ATTEMPT_RESULTS } from '@/types/status';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  Truck,
  MapPin,
  User,
  MessageSquare 
} from 'lucide-react';

interface StatusTimelineProps {
  history: OrderStatusHistory[];
  deliveryAttempts: DeliveryAttempt[];
}

export function StatusTimeline({ history, deliveryAttempts }: StatusTimelineProps) {
  // Merge history and delivery attempts into a single timeline
  const timeline = [
    ...history.map((h) => ({
      type: 'status' as const,
      date: new Date(h.created_at),
      data: h,
    })),
    ...deliveryAttempts.map((a) => ({
      type: 'attempt' as const,
      date: new Date(a.created_at),
      data: a,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (timeline.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No History</h3>
        <p className="text-gray-500 mt-2">
          Status updates will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Status Timeline</h3>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline items */}
          <div className="space-y-6">
            {timeline.map((item, index) => (
              <TimelineItem key={index} item={item} isFirst={index === 0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  item,
  isFirst,
}: {
  item: {
    type: 'status' | 'attempt';
    date: Date;
    data: OrderStatusHistory | DeliveryAttempt;
  };
  isFirst: boolean;
}) {
  if (item.type === 'status') {
    const history = item.data as OrderStatusHistory;
    const statusInfo = getStatusDisplayInfo(history.new_status);

    return (
      <div className="relative flex items-start">
        {/* Icon */}
        <div
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
            isFirst ? statusInfo.bgColor : 'bg-gray-100'
          }`}
        >
          {statusInfo.isRTO ? (
            <RotateCcw className={`h-4 w-4 ${isFirst ? statusInfo.color : 'text-gray-400'}`} />
          ) : history.new_status === 'delivered' ? (
            <CheckCircle2 className={`h-4 w-4 ${isFirst ? statusInfo.color : 'text-gray-400'}`} />
          ) : (
            <Truck className={`h-4 w-4 ${isFirst ? statusInfo.color : 'text-gray-400'}`} />
          )}
        </div>

        {/* Content */}
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
              {history.previous_status && (
                <span className="text-xs text-gray-400 ml-2">
                  from {getStatusDisplayInfo(history.previous_status).label}
                </span>
              )}
            </div>
            <time className="text-xs text-gray-500">
              {formatDistanceToNow(item.date, { addSuffix: true })}
            </time>
          </div>

          {history.notes && (
            <div className="mt-2 flex items-start text-sm text-gray-600">
              <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
              {history.notes}
            </div>
          )}

          <div className="mt-2 flex items-center text-xs text-gray-500">
            <User className="h-3 w-3 mr-1" />
            <span>
              {history.updated_by_name || 'System'} ({history.updated_by_role})
            </span>
            <span className="mx-2">•</span>
            <span>{format(item.date, 'MMM d, yyyy h:mm a')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Delivery attempt
  const attempt = item.data as DeliveryAttempt;
  const resultInfo = DELIVERY_ATTEMPT_RESULTS[attempt.result];

  return (
    <div className="relative flex items-start">
      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
      </div>

      {/* Content */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-900">
              Delivery Attempt #{attempt.attempt_number}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 ml-2">
              {resultInfo.label}
            </span>
          </div>
          <time className="text-xs text-gray-500">
            {formatDistanceToNow(item.date, { addSuffix: true })}
          </time>
        </div>

        {attempt.result_description && (
          <p className="mt-2 text-sm text-gray-600">
            {attempt.result_description}
          </p>
        )}

        {attempt.reschedule_requested && attempt.rescheduled_date && (
          <div className="mt-2 text-sm text-blue-600 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Rescheduled to {format(new Date(attempt.rescheduled_date), 'MMM d, yyyy')}
          </div>
        )}

        {attempt.delivery_person_name && (
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            Delivery by: {attempt.delivery_person_name}
          </div>
        )}

        <div className="mt-2 flex items-center text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          <span>Recorded by {attempt.recorded_by_name || 'Unknown'}</span>
          <span className="mx-2">•</span>
          <span>{format(item.date, 'MMM d, yyyy h:mm a')}</span>
        </div>
      </div>
    </div>
  );
}