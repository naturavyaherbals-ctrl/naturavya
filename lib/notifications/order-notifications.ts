import { OrderStatus, DeliveryAttemptResult } from '@/types/order';

interface StatusNotificationParams {
  orderId: string;
  newStatus: OrderStatus;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

interface DeliveryAttemptNotificationParams {
  orderId: string;
  attemptNumber: number;
  result: DeliveryAttemptResult;
  customerEmail?: string;
  customerPhone?: string;
  rescheduledDate?: string;
}

// Mock function to simulate sending email/SMS
export async function sendStatusNotification(params: StatusNotificationParams) {
  console.log('📧 [MOCK] Sending Status Notification:', {
    orderId: params.orderId,
    status: params.newStatus,
    to: params.customerEmail || params.customerPhone,
    notes: params.notes
  });
  
  // In production, you would call SendGrid, Twilio, or AWS SES here
  return true;
}

// Mock function for delivery attempts
export async function sendDeliveryAttemptNotification(params: DeliveryAttemptNotificationParams) {
  console.log('📱 [MOCK] Sending Delivery Attempt Notification:', {
    orderId: params.orderId,
    attempt: params.attemptNumber,
    result: params.result,
    to: params.customerPhone
  });
  
  return true;
}