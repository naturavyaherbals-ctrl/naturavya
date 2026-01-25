import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

export default async function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', params.orderId)
    .single();

  if (!order) {
    return <div className="p-20 text-center">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-gray-600">Order #{order.order_number}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          <h2 className="font-bold border-b pb-4 mb-4">Items Summary</h2>
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2">
              <span>{item.product_name} x{item.quantity}</span>
              <span>{formatCurrency(item.total_price)}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 font-bold flex justify-between">
            <span>Total Amount</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/" className="px-6 py-2 bg-green-600 text-white rounded-lg">Home</Link>
          <Link href="/products" className="px-6 py-2 border rounded-lg">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}