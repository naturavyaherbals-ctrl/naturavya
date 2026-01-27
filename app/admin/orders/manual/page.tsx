'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
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
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

// Next.js requires Suspense when using useSearchParams in a client component
export default function ManualOrderPageWrapper() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading form...</div>}>
      <ManualOrderPage />
    </Suspense>
  );
}

function ManualOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 Hook to read URL data
  const supabase = createClient();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Form State
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [leadId, setLeadId] = useState<string | null>(null); // To link order to lead
  const [shippingAddress, setShippingAddress] = useState({ line1: '', city: '', state: '', postalCode: '' });
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', productId: '', name: '', sku: '', quantity: 1, price: 0 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // 1. FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('id, name, sku, price').order('name');
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. PRE-FILL FROM LEAD DATA
  useEffect(() => {
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const incomingLeadId = searchParams.get('leadId');

    if (name || phone || email) {
      setCustomer({
        name: name || '',
        phone: phone || '',
        email: email || '',
      });
    }
    if (incomingLeadId) setLeadId(incomingLeadId);
  }, [searchParams]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), productId: '', name: '', sku: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

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

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!customer.name || !customer.phone) {
      setError('Customer Name and Phone are required');
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
          leadId, // 👈 Passing the leadId to link the data
          items: items.map(i => ({
            id: i.productId,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            price: i.price
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
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-500 mb-8 font-medium text-lg">Order #{createdOrderNumber} is confirmed.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">Create New Order</button>
            <Link href="/admin/orders" className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">Go to Orders List</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link href="/admin/orders" className="text-gray-400 hover:text-gray-800 flex items-center gap-1 text-sm mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">New Manual Order</h1>
          </div>
          {leadId && (
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-100 flex items-center gap-2">
               <User size={14} /> Linked to Lead
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-8 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Section 1: Customer */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-gray-400" /></div>
               <h2 className="text-xl font-bold text-gray-800">Customer Identity</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <input placeholder="Full Name *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              <input placeholder="Phone Number *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              <input placeholder="Email (Optional)" className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold md:col-span-2" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-gray-400" /></div>
               <h2 className="text-xl font-bold text-gray-800">Destination Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <input placeholder="Shipping Address *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold md:col-span-2" value={shippingAddress.line1} onChange={e => setShippingAddress({...shippingAddress, line1: e.target.value})} />
              <input placeholder="City *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
              <input placeholder="State *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} />
              <input placeholder="Pincode *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={shippingAddress.postalCode} onChange={e => setShippingAddress({...shippingAddress, postalCode: e.target.value})} />
            </div>
          </div>

          {/* Section 3: Products */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                 <h2 className="text-xl font-bold text-gray-800">Order Manifest</h2>
              </div>
              <button type="button" onClick={addItem} className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Line Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-6 rounded-3xl relative">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Select Product</label>
                    <select className="w-full p-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 font-bold" value={item.productId} onChange={e => handleProductSelect(item.id, e.target.value)} required disabled={loadingProducts}>
                      <option value="">{loadingProducts ? 'Loading catalog...' : 'Choose Product...'}</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Unit Price</label>
                    <input type="number" className="w-full p-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 font-bold" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Qty</label>
                    <input type="number" min="1" className="w-full p-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 font-bold" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="p-4 text-red-500 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="font-bold text-gray-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-4xl font-black text-blue-600">₹{total.toLocaleString('en-IN')}.00</span>
            </div>
          </div>

          {/* Section 4: Payment */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-gray-400" /></div>
               <h2 className="text-xl font-bold text-gray-800">Settlement Method</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 hover:border-gray-200'}`}>
                <input type="radio" className="w-5 h-5 accent-blue-600" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span className="font-bold text-gray-700">Cash on Delivery (COD)</span>
              </label>
              <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 hover:border-gray-200'}`}>
                <input type="radio" className="w-5 h-5 accent-blue-600" name="payment" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} />
                <span className="font-bold text-gray-700">Prepaid (Payment Done)</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] text-xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-3 transition-all active:scale-[0.98]">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm and Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
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
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

// Next.js requires Suspense when using useSearchParams in a client component
export default function ManualOrderPageWrapper() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading form...</div>}>
      <ManualOrderPage />
    </Suspense>
  );
}

function ManualOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 Hook to read URL data
  const supabase = createClient();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Form State
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [leadId, setLeadId] = useState<string | null>(null); // To link order to lead
  const [shippingAddress, setShippingAddress] = useState({ line1: '', city: '', state: '', postalCode: '' });
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', productId: '', name: '', sku: '', quantity: 1, price: 0 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // 1. FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('id, name, sku, price').order('name');
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. PRE-FILL FROM LEAD DATA
  useEffect(() => {
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const incomingLeadId = searchParams.get('leadId');

    if (name || phone || email) {
      setCustomer({
        name: name || '',
        phone: phone || '',
        email: email || '',
      });
    }
    if (incomingLeadId) setLeadId(incomingLeadId);
  }, [searchParams]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), productId: '', name: '', sku: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

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

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!customer.name || !customer.phone) {
      setError('Customer Name and Phone are required');
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
          leadId, // 👈 Passing the leadId to link the data
          items: items.map(i => ({
            id: i.productId,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            price: i.price
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
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-500 mb-8 font-medium text-lg">Order #{createdOrderNumber} is confirmed.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">Create New Order</button>
            <Link href="/admin/orders" className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">Go to Orders List</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link href="/admin/orders" className="text-gray-400 hover:text-gray-800 flex items-center gap-1 text-sm mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">New Manual Order</h1>
          </div>
          {leadId && (
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-100 flex items-center gap-2">
               <User size={14} /> Linked to Lead
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-8 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Section 1: Customer */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-gray-400" /></div>
               <h2 className="text-xl font-bold text-gray-800">Customer Identity</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <input placeholder="Full Name *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              <input placeholder="Phone Number *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              <input placeholder="Email (Optional)" className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold md:col-span-2" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-gray-400" /></div>
               <h2 className="text-xl font-bold text-gray-800">Destination Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <input placeholder="Shipping Address *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold md:col-span-2" value={shippingAddress.line1} onChange={e => setShippingAddress({...shippingAddress, line1: e.target.value})} />
              <input placeholder="City *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
              <input placeholder="State *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} />
              <input placeholder="Pincode *" required className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" value={shippingAddress.postalCode} onChange={e => setShippingAddress({...shippingAddress, postalCode: e.target.value})} />
            </div>
          </div>

          {/* Section 3: Products */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                 <h2 className="text-xl font-bold text-gray-800">Order Manifest</h2>
              </div>
              <button type="button" onClick={addItem} className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Line Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-6 rounded-3xl relative">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Select Product</label>
                    <select className="w-full p-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 font-bold" value={item.productId} onChange={e => handleProductSelect(item.id, e.target.value)} required disabled={loadingProducts}>
                      <option value="">{loadingProducts ? 'Loading catalog...' : 'Choose Product...'}</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Unit Price</label>
                    <input type="number" className="w-full p-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 font-bold" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Qty</label>
                    <input type="number" min="1" className="w-full p-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 font-bold" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="p-4 text-red-500 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="font-bold text-gray-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-4xl font-black text-blue-600">₹{total.toLocaleString('en-IN')}.00</span>
            </div>
          </div>

          {/* Section 4: Payment */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-gray-400" /></div>
               <h2 className="text-xl font-bold text-gray-800">Settlement Method</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 hover:border-gray-200'}`}>
                <input type="radio" className="w-5 h-5 accent-blue-600" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span className="font-bold text-gray-700">Cash on Delivery (COD)</span>
              </label>
              <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 hover:border-gray-200'}`}>
                <input type="radio" className="w-5 h-5 accent-blue-600" name="payment" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} />
                <span className="font-bold text-gray-700">Prepaid (Payment Done)</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] text-xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-3 transition-all active:scale-[0.98]">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm and Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}