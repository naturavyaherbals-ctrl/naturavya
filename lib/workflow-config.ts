import { LucideIcon, Package, Truck, CheckCircle, AlertTriangle, Box, ClipboardCheck, ArrowRight } from 'lucide-react';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' // Packed
  | 'ready_for_pickup' 
  | 'dispatched' 
  | 'in_transit' 
  | 'ndr' // Non-Delivery Report (Failed Attempt)
  | 'delivered' 
  | 'rto' // Return to Origin
  | 'cancelled';

export interface WorkflowStep {
  status: OrderStatus;
  label: string;
  color: string;
  icon: any;
  nextActions: {
    label: string;
    targetStatus: OrderStatus;
    requiredRole?: ('admin' | 'manager' | 'agent')[];
    requiresInput?: boolean; // If true, opens a modal (e.g., for tracking number or NDR reason)
    inputField?: 'tracking' | 'ndr_reason' | 'rto_reason';
  }[];
}

export const WORKFLOW_CONFIG: Record<OrderStatus, WorkflowStep> = {
  pending: {
    status: 'pending',
    label: 'New Order',
    color: 'bg-gray-100 text-gray-800',
    icon: ClipboardCheck,
    nextActions: [
      { label: 'Confirm Order', targetStatus: 'confirmed', requiredRole: ['admin', 'manager', 'agent'] },
      { label: 'Cancel Order', targetStatus: 'cancelled', requiredRole: ['admin', 'manager'] }
    ]
  },
  confirmed: {
    status: 'confirmed',
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    nextActions: [
      { label: 'Mark Packed', targetStatus: 'processing', requiredRole: ['admin', 'manager', 'agent'] }
    ]
  },
  processing: {
    status: 'processing',
    label: 'Packed',
    color: 'bg-purple-100 text-purple-800',
    icon: Box,
    nextActions: [
      { label: 'Ready for Pickup', targetStatus: 'ready_for_pickup', requiredRole: ['admin', 'manager', 'agent'] }
    ]
  },
  ready_for_pickup: {
    status: 'ready_for_pickup',
    label: 'Ready for Pickup',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Package,
    nextActions: [
      { label: 'Dispatch Order', targetStatus: 'dispatched', requiredRole: ['admin', 'manager'], requiresInput: true, inputField: 'tracking' }
    ]
  },
  dispatched: {
    status: 'dispatched',
    label: 'Dispatched',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Truck,
    nextActions: [
      { label: 'Mark In Transit', targetStatus: 'in_transit', requiredRole: ['admin', 'manager', 'agent'] }
    ]
  },
  in_transit: {
    status: 'in_transit',
    label: 'In Transit',
    color: 'bg-orange-100 text-orange-800',
    icon: Truck,
    nextActions: [
      { label: 'Mark Delivered', targetStatus: 'delivered', requiredRole: ['admin', 'manager', 'agent'] },
      { label: 'Delivery Attempt Failed (NDR)', targetStatus: 'ndr', requiredRole: ['admin', 'manager', 'agent'], requiresInput: true, inputField: 'ndr_reason' }
    ]
  },
  ndr: {
    status: 'ndr',
    label: 'NDR / Failed Attempt',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    nextActions: [
      { label: 'Re-attempt Delivery', targetStatus: 'in_transit', requiredRole: ['admin', 'manager'] },
      { label: 'Mark RTO', targetStatus: 'rto', requiredRole: ['admin', 'manager'], requiresInput: true, inputField: 'rto_reason' }
    ]
  },
  delivered: {
    status: 'delivered',
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    nextActions: [] // End of lifecycle
  },
  rto: {
    status: 'rto',
    label: 'Returned to Origin',
    color: 'bg-red-200 text-red-900',
    icon: ArrowRight,
    nextActions: [] // End of lifecycle
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelled',
    color: 'bg-gray-200 text-gray-500',
    icon: X,
    nextActions: []
  }
};
