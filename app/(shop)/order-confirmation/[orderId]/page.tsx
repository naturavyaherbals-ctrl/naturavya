import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Phone, Mail, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Order, OrderItem } from '@/types/database';

interface PageProps {
  params: { orderId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Order Confirmed | Naturavya Herbals`,
    description: 'Your order has been placed successfully.',
  };
}

async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data as Order;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const order = await getOrder(params.orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We've received your order and will begin processing it soon.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Order Header */}
          <div className="bg-green-50 px-6 py-4 border-b">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Status</p>
                <p className="text-sm text-yellow-600 capitalize">{order.status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: OrderItem) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-sm text-gray-500">{item.variant_name}</p>
                    )}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{order.shipping_amount === 0 ? 'FREE' : formatCurrency(order.shipping_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Shipping Info */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
              <p className="text-gray-600 capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
              </p>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                Status: {order.payment_status.replace('_', ' ')}
              </p>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-gray-600">
                {order.shipping_name}<br />
                {order.shipping_address_line1}<br />
                {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
                {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br />
                {order.shipping_country}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Phone: {order.shipping_phone}
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                <span className="text-green-600 font-medium text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Processing</p>
                <p className="text-sm text-gray-600">We'll verify and prepare your order for shipping.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full flex-shrink-0">
                <span className="text-gray-600 font-medium text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Shipping</p>
                <p className="text-sm text-gray-600">Your order will be shipped and you'll receive tracking details.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full flex-shrink-0">
                <span className="text-gray-600 font-medium text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Delivery</p>
                <p className="text-sm text-gray-600">
                  Expected delivery within 3-7 business days.
                  {order.payment_method === 'cod' && ' Pay cash upon delivery.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:+91XXXXXXXXXX"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <Phone className="w-5 h-5" />
              <span>Call Support</span>
            </a>
            <a
              href="mailto:support@naturavya.com"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <Mail className="w-5 h-5" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/track-order?order=${order.order_number}`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Truck className="w-5 h-5" />
            Track Order
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}