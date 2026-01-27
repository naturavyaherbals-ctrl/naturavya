export const WORKFLOW_REQUIREMENTS: Record<string, {
  label: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'url';
    required: boolean;
    options?: string[]; // For select types
    placeholder?: string;
  }[];
}> = {
  // 1. CONFIRMATION
  confirmed: {
    label: 'Confirm Order',
    fields: [
      { name: 'confirmation_method', label: 'Confirmation Method', type: 'select', options: ['Call', 'WhatsApp', 'SMS', 'Auto'], required: true },
      { name: 'expected_ship_date', label: 'Expected Ship Date', type: 'date', required: true },
      { name: 'customer_remarks', label: 'Customer Remarks', type: 'textarea', required: false, placeholder: 'Any special instructions...' }
    ]
  },

  // 2. PACKING
  processing: { 
    label: 'Mark as Packed',
    fields: [
      { name: 'package_weight', label: 'Weight (kg)', type: 'number', required: true, placeholder: '0.5' },
      { name: 'package_dimensions', label: 'Dimensions (LxWxH)', type: 'text', required: true, placeholder: '10x10x5' },
      { name: 'box_count', label: 'Number of Boxes', type: 'number', required: true, placeholder: '1' },
      { name: 'packer_name', label: 'Packed By (Name/ID)', type: 'text', required: true }
    ]
  },

  // 3. READY FOR PICKUP
  ready_for_pickup: {
    label: 'Ready for Pickup',
    fields: [
      { name: 'pickup_scheduled_at', label: 'Scheduled Pickup Time', type: 'date', required: true },
      { name: 'manifest_id', label: 'Manifest ID', type: 'text', required: false }
    ]
  },

  // 4. DISPATCH (Handover to Courier)
  dispatched: {
    label: 'Mark Dispatched',
    fields: [
      { name: 'courier_name', label: 'Courier Partner', type: 'select', options: ['Delhivery', 'BlueDart', 'EcomExpress', 'XpressBees', 'DTDC', 'Shadowfax', 'Other'], required: true },
      { name: 'awb_number', label: 'AWB / Tracking Number', type: 'text', required: true, placeholder: 'Scan or type AWB' },
      { name: 'tracking_link', label: 'Tracking URL', type: 'url', required: false }
    ]
  },

  // 5. IN TRANSIT (Just a status change, usually automated via webhook, but manual option here)
  in_transit: {
    label: 'Mark In Transit',
    fields: [
      { name: 'current_location', label: 'Current Location', type: 'text', required: false, placeholder: 'Hub City' }
    ]
  },

  // 6. DELIVERY ATTEMPTS (Generic config for all attempts)
  delivery_attempt: { 
    label: 'Record Failed Attempt',
    fields: [
      { name: 'delivery_boy_name', label: 'Delivery Boy Name', type: 'text', required: false },
      { name: 'delivery_boy_phone', label: 'Delivery Boy Phone', type: 'text', required: false },
      { name: 'failure_reason', label: 'Reason for Non-Delivery', type: 'select', options: ['Customer Unavailable', 'Door Locked', 'Phone Unreachable', 'Refused', 'Address Issue', 'Fake Attempt', 'COD Amount Not Ready'], required: true },
      { name: 'call_response', label: 'Customer Call Response', type: 'textarea', required: true, placeholder: 'What did the customer say when you called?' },
      { name: 'next_attempt_date', label: 'Next Attempt Date', type: 'date', required: true }
    ]
  },

  // 7. DELIVERED
  delivered: {
    label: 'Mark Delivered',
    fields: [
      { name: 'actual_delivery_date', label: 'Actual Delivery Date', type: 'date', required: true },
      { name: 'pod_link', label: 'Proof of Delivery (Link)', type: 'url', required: false, placeholder: 'Image URL of signature/package' },
      { name: 'receiver_name', label: 'Received By', type: 'text', required: true, placeholder: 'Customer or Relative Name' }
    ]
  },

  // 8. RTO
  rto_initiated: {
    label: 'Initiate RTO',
    fields: [
      { name: 'rto_reason', label: 'RTO Reason', type: 'select', options: ['Customer Refused', 'Address Invalid', 'Lost in Transit', 'Damaged', 'NDR Exhausted'], required: true },
      { name: 'return_awb', label: 'Return AWB (if different)', type: 'text', required: false }
    ]
  },

  // DEFAULT FALLBACK
  default: {
    label: 'Update Status',
    fields: [
      { name: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Add a note...' }
    ]
  }
};