'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, User, Mail, Phone, Calendar } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE CLIENT ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      
      // We fetch from the 'orders' table to get customer details
      // (Since you likely don't have a separate 'customers' table yet, 
      // we extract unique customers from the orders list)
      const { data, error } = await supabase
        .from('orders')
        .select('customer_name, customer_email, phone, created_at, address, city, state')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customers:', error)
      } else {
        // Filter to remove duplicates based on email
        const uniqueCustomers = data ? Array.from(new Map(data.map(item => [item.customer_email, item])).values()) : []
        setCustomers(uniqueCustomers)
      }
      setLoading(false)
    }

    fetchCustomers()
  }, [])

  // --- 3. FILTERING ---
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (customer.customer_name?.toLowerCase() || '').includes(searchLower) ||
      (customer.customer_email?.toLowerCase() || '').includes(searchLower) ||
      (customer.phone || '').includes(searchLower)
    )
  })

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">View your customer base</p>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 md:mt-0 relative">
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Seen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                 <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                 <tr><td colSpan={4} className="p-8 text-center text-gray-500">No customers found.</td></tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-700">
                          <User size={16} />
                        </div>
                        <div className="font-medium text-gray-900">{customer.customer_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {customer.customer_email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          {customer.phone || 'No phone'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.city && customer.state 
                        ? `${customer.city}, ${customer.state}` 
                        : 'Unknown Location'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
