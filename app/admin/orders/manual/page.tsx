'use client'; // This MUST be the first line

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

// 1. WRAPPER COMPONENT (Required by Next.js for useSearchParams)
export default function ManualOrderPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Initializing order form...</p>
        </div>
      </div>
    }>
      <ManualOrderPage />
    </Suspense>
  );
}

// 2. MAIN FORM COMPONENT
function ManualOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Form State
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [leadId, setLeadId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({ line1: '', city: '', state: '', postalCode: '' });
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', productId: '', name: '', sku: '', quantity: 1, price: 0 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Fetch Products
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
  }, [supabase]);

  // Pre-fill from URL (Lead Data)
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
          leadId,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-emerald-950">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Order Confirmed</h2>
          <p className="text-gray-500 mb-8 font-medium text-lg">Ticket #{createdOrderNumber}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-950 shadow-xl transition-all">Create New Order</button>
            <Link href="/admin/orders" className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all text-center">Go to Orders List</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-10 text-emerald-950">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link href="/admin/orders" className="text-emerald-800/50 hover:text-emerald-900 flex items-center gap-1 text-sm mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </Link>
            <h1 className="text-3xl font-serif font-bold">Manual Order Entry</h1>
          </div>
          {leadId && (
            <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-2">
               <User size={14} /> Linked Lead
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-8 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Section 1: Customer */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-900/5">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-emerald-600" /></div>
               <h2 className="text-xl font-bold">Client Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-emerald-800/40 ml-1">Full Name</label>
                <input required className="w-full p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-emerald-800/40 ml-1">Phone Number</label>
                <input required className="w-full p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-emerald-800/40 ml-1">Email Address</label>
                <input className="w-full p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-900/5">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-emerald-600" /></div>
               <h2 className="text-xl font-bold">Shipping Destination</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <input placeholder="Street Address *" required className="p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold md:col-span-2" value={shippingAddress.line1} onChange={e => setShippingAddress({...shippingAddress, line1: e.target.value})} />
              <input placeholder="City *" required className="p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
              <input placeholder="State *" required className="p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} />
              <input placeholder="Pincode *" required className="p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" value={shippingAddress.postalCode} onChange={e => setShippingAddress({...shippingAddress, postalCode: e.target.value})} />
            </div>
          </div>

          {/* Section 3: Products */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-900/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-emerald-600" /></div>
                 <h2 className="text-xl font-bold">Product Manifest</h2>
              </div>
              <button type="button" onClick={addItem} className="text-emerald-900 font-bold text-xs bg-emerald-100/50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1 uppercase tracking-widest">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 items-end bg-[#fdfbf7] p-6 rounded-3xl relative border border-emerald-900/5">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-2 block ml-1">Select Product</label>
                    <select className="w-full p-4 bg-white border border-emerald-900/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 appearance-none" value={item.productId} onChange={e => handleProductSelect(item.id, e.target.value)} required disabled={loadingProducts}>
                      <option value="">{loadingProducts ? 'Loading catalog...' : 'Choose Product...'}</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-2 block ml-1">Price (₹)</label>
                    <input type="number" className="w-full p-4 bg-white border border-emerald-900/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-2 block ml-1">Qty</label>
                    <input type="number" min="1" className="w-full p-4 bg-white border border-emerald-900/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-emerald-900/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="font-bold text-emerald-800/30 uppercase tracking-widest text-sm">Amount Payable</span>
              <span className="text-4xl font-black text-emerald-900">₹{total.toLocaleString('en-IN')}.00</span>
            </div>
          </div>

          {/* Section 4: Payment */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-900/5">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
               <h2 className="text-xl font-bold">Billing Model</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50' : 'border-emerald-50 hover:border-emerald-200'}`}>
                <input type="radio" className="w-5 h-5 accent-emerald-900" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span className="font-bold text-emerald-900">Cash on Delivery (COD)</span>
              </label>
              <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? 'border-emerald-600 bg-emerald-50/50' : 'border-emerald-50 hover:border-emerald-200'}`}>
                <input type="radio" className="w-5 h-5 accent-emerald-900" name="payment" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} />
                <span className="font-bold text-emerald-900">Prepaid (Digital Payment)</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-6 bg-emerald-900 text-white rounded-[1.5rem] text-xl font-black shadow-2xl shadow-emerald-900/20 hover:bg-emerald-950 disabled:opacity-70 flex justify-center items-center gap-3 transition-all active:scale-[0.98]">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Finalize Order'}
          </button>
        </form>
      </div>
    </div>
  );
}