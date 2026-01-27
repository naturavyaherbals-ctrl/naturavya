'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle, Package, User, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface OrderItem {
  id: string; // unique row id for UI
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export default function ManualOrderPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Form State
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [shippingAddress, setShippingAddress] = useState({ line1: '', city: '', state: '', postalCode: '' });
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', productId: '', name: '', sku: '', quantity: 1, price: 0 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // FETCH PRODUCTS ON MOUNT
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, price') // Make sure these match your DB columns
          .order('name');
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
        // Fallback or alert if needed
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Calculate Total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Add Item Row
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), productId: '', name: '', sku: '', quantity: 1, price: 0 }]);
  };

  // Remove Item Row
  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  // Handle Product Selection
  const handleProductSelect = (rowId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItems(items.map(item => 
        item.id === rowId 
          ? { ...item, productId: product.id, name: product.name, sku: product.sku || '', price: product.price || 0 } 
          : item
      ));
    }
  };

  // Handle Quantity/Price Change
  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!customer.name || !customer.phone) {
      setError('Customer Name and Phone are required');
      setIsLoading(false);
      return;
    }
    if (items.some(i => !i.productId)) {
      setError('Please select a product for all items');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress,
          items: items.map(i => ({
            id: i.productId, // Pass actual product ID
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            price: i.price // Use the manually edited price
          })),
          paymentMethod,
          shippingCost: 0,
          discount: 0,
          tax: 0
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSuccess('Order Created Successfully!');
      setCreatedOrderNumber(result.orderNumber);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Order #{createdOrderNumber}</p>
          <div className="flex gap-3">
            <Link href="/admin/orders" className="flex-1 py-2 border rounded hover:bg-gray-50">View Orders</Link>
            <button onClick={() => window.location.reload()} className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">New Order</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/orders" className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold">Create Manual Order</h1>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer */}
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
              <User className="w-5 h-5" /> Customer Details
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                placeholder="Full Name *" 
                className="p-2 border rounded"
                value={customer.name}
                onChange={e => setCustomer({...customer, name: e.target.value})}
                required
              />
              <input 
                placeholder="Phone Number *" 
                className="p-2 border rounded"
                value={customer.phone}
                onChange={e => setCustomer({...customer, phone: e.target.value})}
                required
              />
              <input 
                placeholder="Email (Optional)" 
                className="p-2 border rounded md:col-span-2"
                value={customer.email}
                onChange={e => setCustomer({...customer, email: e.target.value})}
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
              <MapPin className="w-5 h-5" /> Shipping Address
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                placeholder="Address Line 1 *" 
                className="p-2 border rounded md:col-span-2"
                value={shippingAddress.line1}
                onChange={e => setShippingAddress({...shippingAddress, line1: e.target.value})}
                required
              />
              <input 
                placeholder="City *" 
                className="p-2 border rounded"
                value={shippingAddress.city}
                onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
                required
              />
              <input 
                placeholder="State *" 
                className="p-2 border rounded"
                value={shippingAddress.state}
                onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})}
                required
              />
              <input 
                placeholder="Pincode *" 
                className="p-2 border rounded"
                value={shippingAddress.postalCode}
                onChange={e => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between mb-4 font-semibold text-gray-700">
              <div className="flex items-center gap-2"><Package className="w-5 h-5" /> Order Items</div>
              <button type="button" onClick={addItem} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-end bg-gray-50 p-3 rounded">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Product</label>
                    <select 
                      className="w-full p-2 border rounded bg-white"
                      value={item.productId}
                      onChange={e => handleProductSelect(item.id, e.target.value)}
                      required
                      disabled={loadingProducts}
                    >
                      <option value="">{loadingProducts ? 'Loading...' : 'Select Product...'}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-24">
                    <label className="text-xs text-gray-500 block mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={item.price}
                      onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="w-20">
                    <label className="text-xs text-gray-500 block mb-1">Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full p-2 border rounded"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="pb-2 text-red-500 cursor-pointer hover:text-red-700">
                    {items.length > 1 && (
                      <Trash2 className="w-5 h-5" onClick={() => removeItem(item.id)} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total Amount:</span>
              <span className="text-xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
              <CreditCard className="w-5 h-5" /> Payment Method
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-gray-50 flex-1">
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-gray-50 flex-1">
                <input type="radio" name="payment" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} />
                <span>Prepaid (Already Paid)</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Creating Order...' : 'Place Order'}
          </button>

        </form>
      </div>
    </div>
  );
}