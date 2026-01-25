// =====================================================
// CHECKOUT PAGE - SERVER COMPONENT
// =====================================================

import { Metadata } from 'next';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout | Naturavya Herbals',
  description: 'Complete your order with secure checkout.',
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
        <CheckoutForm />
      </div>
    </main>
  );
}
