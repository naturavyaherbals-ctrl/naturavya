'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/useOrders';
import { StatusTimeline } from '../components/StatusTimeline';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { getStatusDisplayInfo } from '@/types/status';
import { format } from 'date-fns';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  Clock,
  Truck,
  Edit,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Receipt,
  CreditCard,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data, isLoading, error, refetch } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800">Order Not Found</h2>
          <p className="mt-2 text-red-600">
            {error?.message || 'Unable to load order details'}
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center text-red-600 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const { order, status_history, delivery_attempts, rto_details } = data;
  const statusInfo = getStatusDisplayInfo(order.current_status);

  // Helper to safely get items array
  const orderItems = Array.isArray(order.items) ? order.items : [];

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.order_number}
              </h1>
              <p className="text-gray-500 mt-1">
                Placed on {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
              >
                {order.is_rto && <RotateCcw className="h-4 w-4 mr-2" />}
                {statusInfo.label}
              </span>
              <button
                onClick={() => setShowStatusModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Attempts Warning */}
            {order.delivery_attempts_count >= 3 && !order.is_rto && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-orange-800">
                    High Delivery Attempts
                  </h3>
                  <p className="text-sm text-orange-600 mt-1">
                    {order.delivery_attempts_count === 5
                      ? 'Maximum delivery attempts reached. Please initiate RTO.'
                      : `${5 - order.delivery_attempts_count} delivery attempts remaining before RTO is required.`}
                  </p>
                </div>
              </div>
            )}

            {/* RTO Details Banner */}
            {rto_details && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <RotateCcw className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-800">RTO In Progress</h3>
                    <p className="text-sm text-red-600 mt-1">{rto_details.reason}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-red-500">Initiated:</span>
                        <span className="ml-2 text-red-700">
                          {format(new Date(rto_details.initiated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {rto_details.rto_tracking_number && (
                        <div>
                          <span className="text-red-500">RTO Tracking:</span>
                          <span className="ml-2 text-red-700 font-mono">
                            {rto_details.rto_tracking_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  Customer Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">
                      Contact Details
                    </h4>
                    <p className="text-gray-900 font-medium">{order.customer_name}</p>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {order.customer_phone}
                      </p>
                      <p className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {order.customer_email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">
                      Shipping Address
                    </h4>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p>{order.shipping_address?.line1}</p>
                        {order.shipping_address?.line2 && (
                          <p>{order.shipping_address.line2}</p>
                        )}
                        <p>
                          {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
                          {order.shipping_address?.postal_code}
                        </p>
                        <p>{order.shipping_address?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Details Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-400" />
                  Shipping Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Courier Partner</p>
                    <p className="text-gray-900 font-medium">{order.courier_partner || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tracking Number</p>
                    <p className="text-gray-900 font-mono">
                      {order.tracking_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</p>
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {order.estimated_delivery_date 
                        ? format(new Date(order.estimated_delivery_date), 'MMM d, yyyy')
                        : 'Pending'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Actual Delivery</p>
                    <div className="flex items-center text-gray-900">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-gray-400" />
                      {order.actual_delivery_date
                        ? format(new Date(order.actual_delivery_date), 'MMM d, yyyy')
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  Order Items
                </h3>
                <span className="text-sm text-gray-500">{orderItems.length} items</span>
              </div>
              <div className="divide-y">
                {orderItems.map((item: any, index: number) => (
                  <div key={item.id || index} className="p-6 flex items-start space-x-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            SKU: {item.sku}
                            {item.variant && <span className="ml-2">• {item.variant}</span>}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Payment Summary */}
              <div className="bg-gray-50 p-6 border-t rounded-b-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      Payment Method
                    </p>
                    <p className="text-sm text-gray-600 capitalize pl-6">
                      {order.payment_method?.replace('_', ' ') || 'COD'}
                    </p>
                  </div>
                  
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(order.shipping_cost)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(order.tax)}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-base font-bold text-blue-600">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status Timeline */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  Order History
                </h3>
              </div>
              <div className="p-6">
                <StatusTimeline 
                  history={status_history} 
                  deliveryAttempts={delivery_attempts} 
                />
              </div>
            </div>

            {/* Quick Actions (Optional) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Print Invoice
                </button>
                {/* Add more action buttons here if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal
          order={order}
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            refetch(); // Refresh data after update
          }}
        />
      )}
    </div>
  );
}