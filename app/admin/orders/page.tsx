'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { X, CheckCircle, Truck, XCircle, Eye, Search, Calendar } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE CLIENT ---
// We use the standard client to avoid version conflicts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function OrdersPage() {
  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All Orders')
  const [selectedOrder, setSelectedOrder] = useState<any>(null) // For the Modal
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  // --- 2. FETCH ORDERS ---
  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // --- 3. UPDATE STATUS FUNCTION ---
  const updateStatus = async (orderId: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      // Update local UI immediately
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      
      // If modal is open, update the selected order object too so the UI refreshes
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
      
      // Optional: Close modal after success (Uncomment if desired)
      // setSelectedOrder(null) 
    } else {
      alert('Failed to update status')
    }
  }

  // --- 4. FILTERING LOGIC ---
  const filteredOrders = orders.filter((order) => {
    // Tab Filter
    const matchesTab = activeTab === 'All Orders' ? true : order.status === activeTab
    
    // Search Filter (Checks Name, Email, or Order ID)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.customer_email?.toLowerCase().includes(searchLower)

    return matchesTab && matchesSearch
  })

  // --- HELPER: BADGE COLORS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700'
      case 'Shipped': return 'bg-blue-100 text-blue-700'
      case 'Processing': return 'bg-yellow-100 text-yellow-700'
      case 'Pending': return 'bg-orange-100 text-orange-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 relative min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">Manage and track customer orders</p>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 md:mt-0 relative">
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* TABS */}
      <div className="bg-white p-2 rounded-lg shadow-sm mb-6 inline-flex gap-2 overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">Rs. {order.total_amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded border border-green-200 text-sm font-medium flex items-center gap-1 ml-auto"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === ORDER DETAILS MODAL === */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.order_number}</h2>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Customer Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-900 text-lg">{selectedOrder.customer_name}</p>
                    <p className="text-gray-600 text-sm mt-1">{selectedOrder.customer_email}</p>
                    <p className="text-gray-600 text-sm">{selectedOrder.phone || 'No phone number'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700">
                    {selectedOrder.address ? (
                      <>
                        <p>{selectedOrder.address}</p>
                        <p>{selectedOrder.city}, {selectedOrder.state}</p>
                        <p>{selectedOrder.zip_code}</p>
                      </>
                    ) : (
                      <p className="italic text-gray-400">No address provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Column */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                  <div className="p-4 space-y-3">
                    {/* Handle both String and Array JSON formats safely */}
                    {(Array.isArray(selectedOrder.products) 
                      ? selectedOrder.products 
                      : JSON.parse(selectedOrder.products || '[]')
                    ).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-800">{item}</span>
                        <span className="text-gray-500">x1</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-100 p-4 flex justify-between items-center border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-bold text-indigo-600 text-lg">Rs. {selectedOrder.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-3 justify-end sticky bottom-0">
              
              {/* APPROVE BUTTON (Only if Pending) */}
              {selectedOrder.status === 'Pending' && (
                <button 
                  onClick={() => updateStatus(selectedOrder.id, 'Processing')}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-sm transition-all font-medium"
                >
                  <CheckCircle size={18} /> Approve Order
                </button>
              )}

              {/* SHIP BUTTON (If Processing or Pending) */}
              {(selectedOrder.status === 'Processing' || selectedOrder.status === 'Pending') && (
                <button 
                  onClick={() => updateStatus(selectedOrder.id, 'Shipped')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition-all font-medium"
                >
                  <Truck size={18} /> Mark as Shipped
                </button>
              )}

              {/* DELIVER BUTTON (If Shipped) */}
               {selectedOrder.status === 'Shipped' && (
                <button 
                  onClick={() => updateStatus(selectedOrder.id, 'Delivered')}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-sm transition-all font-medium"
                >
                  <CheckCircle size={18} /> Mark Delivered
                </button>
              )}

              {/* REJECT BUTTON (Always Visible unless already cancelled) */}
              {selectedOrder.status !== 'Cancelled' && (
                <button 
                  onClick={() => updateStatus(selectedOrder.id, 'Cancelled')}
                  className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-medium"
                >
                  <XCircle size={18} /> Cancel Order
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}