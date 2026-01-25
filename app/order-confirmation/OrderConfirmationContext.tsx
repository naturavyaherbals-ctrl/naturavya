'use client';

// =====================================================
// ORDER CONFIRMATION CONTENT
// =====================================================

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Phone, Mail, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import type { Order } from '@/types';

export default function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    } else {
      setIsLoading(false);
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/by-number/${orderNumber}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!orderNumber || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for shopping with Naturavya Herbals
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-bold text-primary">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">
                {order ? new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }) : new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs mt-2 text-green-600 font-medium">Confirmed</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-green-500 w-1/4" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs mt-2 text-gray-500">Processing</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs mt-2 text-gray-500">Shipped</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs mt-2 text-gray-500">Delivered</span>
            </div>
          </div>

          {/* Order Items */}
          {order?.items && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.variant_name && (
                        <p className="text-sm text-gray-500">{item.variant_name}</p>
                      )}
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Totals */}
          <div className="border-t mt-6 pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{order ? formatCurrency(order.subtotal) : '-'}</span>
            </div>
            {order && order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>
                {order?.shipping_amount === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  order ? formatCurrency(order.shipping_amount) : '-'
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">
                {order ? formatCurrency(order.total) : '-'}
              </span>
            </div>
            <div className="text-sm text-gray-500 text-right">
              Payment: {order?.payment_method === 'cod' ? 'Cash on Delivery' : order?.payment_method}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              {order.shipping_landmark && <p>Near: {order.shipping_landmark}</p>}
              <p>
                {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
              </p>
              <p>Phone: {order.shipping_phone}</p>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>You will receive an order confirmation SMS/WhatsApp shortly.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Our team will process your order within 24-48 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>You'll get tracking details once your order is shipped.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Expected delivery: 5-7 business days.</span>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold mb-4">Need Help?</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="tel:+91XXXXXXXXXX"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-sm text-gray-500">+91-XXXXXXXXXX</p>
              </div>
            </a>
            <a
              href="mailto:support@naturavya.com"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-sm text-gray-500">support@naturavya.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}