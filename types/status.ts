// =====================================================
// Status Management Types
// =====================================================

import { OrderStatus, DeliveryAttemptResult, UserRole, UpdateSource } from './order';

// Status Update Request
export interface StatusUpdateRequest {
  order_id: string;
  new_status: OrderStatus;
  notes?: string;
  internal_notes?: string;
  notify_customer?: boolean;
}

// Delivery Attempt Request
export interface DeliveryAttemptRequest {
  order_id: string;
  result: DeliveryAttemptResult;
  result_description?: string;
  delivery_person_name?: string;
  delivery_person_phone?: string;
  customer_response?: string;
  reschedule_requested?: boolean;
  rescheduled_date?: string;
  notes?: string;
  photo_url?: string;
  geo_location?: { lat: number; lng: number };
  notify_customer?: boolean;
}

// RTO Initiation Request
export interface RTOInitiationRequest {
  order_id: string;
  reason: string;
  reason_category?: string;
  notes?: string;
  notify_customer?: boolean;
}

// Status Update Response
export interface StatusUpdateResponse {
  success: boolean;
  history_id?: string;
  previous_status?: OrderStatus;
  new_status?: OrderStatus;
  order_id?: string;
  error?: string;
  notification_sent?: boolean;
}

// Delivery Attempt Response
export interface DeliveryAttemptResponse {
  success: boolean;
  attempt_id?: string;
  attempt_number?: number;
  new_status?: OrderStatus;
  status_history_id?: string;
  error?: string;
}

// Status Configuration
export interface StatusConfig {
  status: OrderStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  allowedTransitions: OrderStatus[];
  requiresNote: boolean;
  isDeliveryAttempt: boolean;
  isRTO: boolean;
  isFinal: boolean;
}

// Status Transition Map
export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    status: 'pending',
    label: 'Pending',
    description: 'Order received, awaiting confirmation',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'Clock',
    allowedTransitions: ['confirmed', 'cancelled'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: false,
  },
  confirmed: {
    status: 'confirmed',
    label: 'Confirmed',
    description: 'Order confirmed, preparing for processing',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'CheckCircle',
    allowedTransitions: ['processing', 'cancelled'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: false,
  },
  processing: {
    status: 'processing',
    label: 'Processing',
    description: 'Order is being prepared',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: 'Package',
    allowedTransitions: ['dispatched', 'cancelled'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: false,
  },
  dispatched: {
    status: 'dispatched',
    label: 'Dispatched',
    description: 'Order has been handed over to courier',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'Truck',
    allowedTransitions: ['in_transit', 'cancelled'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: false,
  },
  in_transit: {
    status: 'in_transit',
    label: 'In Transit',
    description: 'Package is on its way',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: 'Navigation',
    allowedTransitions: ['out_for_delivery', 'delivery_attempt_1', 'delivered', 'rto_initiated'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: false,
  },
  out_for_delivery: {
    status: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Package is out for delivery today',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    icon: 'MapPin',
    allowedTransitions: ['delivery_attempt_1', 'delivered'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: false,
  },
  delivery_attempt_1: {
    status: 'delivery_attempt_1',
    label: '1st Delivery Attempt',
    description: 'First delivery attempt made',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'AlertCircle',
    allowedTransitions: ['delivery_attempt_2', 'delivered', 'rto_initiated'],
    requiresNote: true,
    isDeliveryAttempt: true,
    isRTO: false,
    isFinal: false,
  },
  delivery_attempt_2: {
    status: 'delivery_attempt_2',
    label: '2nd Delivery Attempt',
    description: 'Second delivery attempt made',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'AlertCircle',
    allowedTransitions: ['delivery_attempt_3', 'delivered', 'rto_initiated'],
    requiresNote: true,
    isDeliveryAttempt: true,
    isRTO: false,
    isFinal: false,
  },
  delivery_attempt_3: {
    status: 'delivery_attempt_3',
    label: '3rd Delivery Attempt',
    description: 'Third delivery attempt made',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: 'AlertTriangle',
    allowedTransitions: ['delivery_attempt_4', 'delivered', 'rto_initiated'],
    requiresNote: true,
    isDeliveryAttempt: true,
    isRTO: false,
    isFinal: false,
  },
  delivery_attempt_4: {
    status: 'delivery_attempt_4',
    label: '4th Delivery Attempt',
    description: 'Fourth delivery attempt made',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    icon: 'AlertTriangle',
    allowedTransitions: ['delivery_attempt_5', 'delivered', 'rto_initiated'],
    requiresNote: true,
    isDeliveryAttempt: true,
    isRTO: false,
    isFinal: false,
  },
  delivery_attempt_5: {
    status: 'delivery_attempt_5',
    label: '5th Delivery Attempt',
    description: 'Final delivery attempt - Maximum reached',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'XCircle',
    allowedTransitions: ['delivered', 'rto_initiated'],
    requiresNote: true,
    isDeliveryAttempt: true,
    isRTO: false,
    isFinal: false,
  },
  delivered: {
    status: 'delivered',
    label: 'Delivered',
    description: 'Order successfully delivered',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle2',
    allowedTransitions: [],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: true,
  },
  rto_initiated: {
    status: 'rto_initiated',
    label: 'RTO Initiated',
    description: 'Return to origin process started',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'RotateCcw',
    allowedTransitions: ['rto_in_transit'],
    requiresNote: true,
    isDeliveryAttempt: false,
    isRTO: true,
    isFinal: false,
  },
  rto_in_transit: {
    status: 'rto_in_transit',
    label: 'RTO In Transit',
    description: 'Package returning to warehouse',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    icon: 'Truck',
    allowedTransitions: ['rto_received'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: true,
    isFinal: false,
  },
  rto_received: {
    status: 'rto_received',
    label: 'RTO Received',
    description: 'Package received back at warehouse',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'Warehouse',
    allowedTransitions: ['refunded'],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: true,
    isFinal: false,
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelled',
    description: 'Order has been cancelled',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'XCircle',
    allowedTransitions: ['refunded'],
    requiresNote: true,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: true,
  },
  refunded: {
    status: 'refunded',
    label: 'Refunded',
    description: 'Order has been refunded',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'DollarSign',
    allowedTransitions: [],
    requiresNote: false,
    isDeliveryAttempt: false,
    isRTO: false,
    isFinal: true,
  },
};

// Delivery Attempt Results Configuration
export const DELIVERY_ATTEMPT_RESULTS: Record<DeliveryAttemptResult, { label: string; description: string }> = {
  customer_unavailable: {
    label: 'Customer Unavailable',
    description: 'Customer was not available at the delivery address',
  },
  wrong_address: {
    label: 'Wrong Address',
    description: 'The delivery address was incorrect or incomplete',
  },
  customer_refused: {
    label: 'Customer Refused',
    description: 'Customer refused to accept the delivery',
  },
  incomplete_address: {
    label: 'Incomplete Address',
    description: 'Address details are incomplete for delivery',
  },
  customer_requested_reschedule: {
    label: 'Reschedule Requested',
    description: 'Customer requested delivery on a different date',
  },
  payment_not_ready: {
    label: 'Payment Not Ready',
    description: 'Customer was not ready with payment (for COD)',
  },
  premises_closed: {
    label: 'Premises Closed',
    description: 'Business premises were closed',
  },
  other: {
    label: 'Other',
    description: 'Other reason for failed delivery',
  },
};

// Helper function to get allowed transitions
export function getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_CONFIG[currentStatus]?.allowedTransitions || [];
}

// Helper function to validate transition
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const config = STATUS_CONFIG[from];
  return config?.allowedTransitions.includes(to) || false;
}

// Helper function to check if status is final
export function isFinalStatus(status: OrderStatus): boolean {
  return STATUS_CONFIG[status]?.isFinal || false;
}

// Helper function to check if status requires RTO
export function isRTOStatus(status: OrderStatus): boolean {
  return STATUS_CONFIG[status]?.isRTO || false;
}

// Helper to get status display info
export function getStatusDisplayInfo(status: OrderStatus) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}