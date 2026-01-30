import { Order } from '@/types/crm';
import { cn } from '@/utils/cn';
import {
  Package,
  Truck,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronRight,
  IndianRupee,
} from 'lucide-react';

interface OrdersPanelProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Pending' },
  confirmed: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Shipped' },
  delivered: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  rto: { icon: RotateCcw, color: 'text-red-600', bg: 'bg-red-100', label: 'RTO' },
  cancelled: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Cancelled' },
};

export function OrdersPanel({ orders, onViewOrder }: OrdersPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const rtoOrders = orders.filter(o => o.is_rto);
  const ndrOrders = orders.filter(o => o.ndr_count > 0 && !o.is_rto);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          Orders & Delivery
          {orders.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              {orders.length}
            </span>
          )}
        </h2>

        {/* RTO/NDR Alert Badges */}
        <div className="flex items-center gap-2">
          {rtoOrders.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">
              <RotateCcw className="w-3 h-3" />
              {rtoOrders.length} RTO
            </span>
          )}
          {ndrOrders.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold">
              <AlertTriangle className="w-3 h-3" />
              {ndrOrders.length} NDR
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm">Create an order to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => onViewOrder(order.id)}
                  className={cn(
                    'group flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                    order.is_rto ? 'bg-red-50 border-red-200' :
                    order.ndr_count > 0 ? 'bg-amber-50 border-amber-200' :
                    'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  {/* Status Icon */}
                  <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', status.bg)}>
                    <StatusIcon className={cn('w-5 h-5', status.color)} />
                  </div>

                  {/* Order Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          #{order.order_number}
                          {order.is_rto && (
                            <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold">
                              RTO
                            </span>
                          )}
                          {order.ndr_count > 0 && !order.is_rto && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">
                              NDR {order.ndr_count}x
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900 text-sm flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {order.total_amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Shipping Info */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      <span className={cn('flex items-center gap-1 px-2 py-1 rounded-md font-medium', status.bg, status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>

                      {order.courier_name && (
                        <span className="text-gray-600 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {order.courier_name}
                        </span>
                      )}

                      {order.awb_number && (
                        <span className="text-gray-500 font-mono">
                          AWB: {order.awb_number}
                        </span>
                      )}

                      {order.current_status && order.current_status !== order.status && (
                        <span className="text-gray-500 italic">
                          {order.current_status}
                        </span>
                      )}
                    </div>

                    {/* Tracking Link */}
                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Track Shipment
                      </a>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-gray-400 transition-colors" />
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Total: {formatCurrency(orders.reduce((sum, o) => sum + o.total_amount, 0))}
            </span>
            <span>
              Delivered: {orders.filter(o => o.status === 'delivered').length}/{orders.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
