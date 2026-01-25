// =====================================================
// ORDER CONFIRMATION PAGE
// =====================================================

import { Metadata } from 'next';
import { Suspense } from 'react';
import OrderConfirmationContent from './OrderConfirmationContent';

export const metadata: Metadata = {
  title: 'Order Confirmed | Naturavya Herbals',
  description: 'Thank you for your order!',
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}