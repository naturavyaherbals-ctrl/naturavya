'use client';

import { useState, useEffect } from 'react';
import { Filter, RefreshCw } from 'lucide-react';

const NDR_REASONS = [
  "Customer Unavailable",
  "Incorrect Address",
  "Customer Refused",
  "COD Not Ready",
  "Customer Rescheduled",
  "Premises Closed",
  "Customer Unreachable",
  "Address Incomplete",
  "Out of Delivery Area"
];

export default function NDRPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterReason, setFilterReason] = useState('All');
  const [loading, setLoading] = useState(true);

  // Mock fetch function - Replace with your actual API endpoint
  const fetchNDROrders = async () => {
    setLoading(true);
    try {
      // Assuming you have an endpoint that returns all NDR orders
      const res = await fetch('/api/admin/orders/ndr'); 
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNDROrders(); }, []);

  // Filter Logic
  const filteredOrders = filterReason === 'All' 
    ? orders 
    : orders.filter(order => order.ndr_reason === filterReason);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">NDR Management</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilterReason('All')}
          className={`px-4 py-2 rounded-full text-sm border ${filterReason === 'All' ? 'bg-blue-600 text-white' : 'bg-white'}`}
        >
          All
        </button>
        {NDR_REASONS.map(reason => (
          <button
            key={reason}
            onClick={() => setFilterReason(reason)}
            className={`px-3 py-2 rounded-full text-sm border whitespace-nowrap ${filterReason === reason ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            {reason}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-medium grid grid-cols-4">
          <div>Order #</div>
          <div>Customer</div>
          <div>NDR Reason</div>
          <div>Status</div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found for this filter.</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="p-4 border-b grid grid-cols-4 items-center hover:bg-gray-50">
              <div className="font-medium text-blue-600">{order.order_number}</div>
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-xs text-gray-500">{order.customer_phone}</p>
              </div>
              <div>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                  {order.ndr_reason}
                </span>
              </div>
              <div className="text-sm text-gray-600">{order.current_status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}