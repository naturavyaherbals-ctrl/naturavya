'use client';

import { useState, useEffect } from 'react';
import { 
  Truck, Package, Search, Printer, FileText, 
  MapPin, Loader2, ArrowRight, CheckCircle, AlertTriangle 
} from 'lucide-react';

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'track'>('dashboard');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600" />
            Shiprocket Logistics
          </h1>
          <p className="text-gray-500 text-sm">Manage shipments, manifests, and tracking.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <TabButton label="Dashboard" id="dashboard" active={activeTab} onClick={setActiveTab} />
        <TabButton label="Create Shipment" id="create" active={activeTab} onClick={setActiveTab} />
        <TabButton label="Track AWB" id="track" active={activeTab} onClick={setActiveTab} />
      </div>

      <div className="pt-4">
        {activeTab === 'dashboard' && <ShiprocketOrders />}
        {activeTab === 'create' && <CreateShipmentForm />}
        {activeTab === 'track' && <TrackAwb />}
      </div>
    </div>
  );
}

function TabButton({ label, id, active, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active === id 
          ? 'border-purple-600 text-purple-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

// --- SUB-COMPONENTS ---

function ShiprocketOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shiprocket', {
        method: 'POST',
        body: JSON.stringify({ action: 'get_orders' })
      });
      const json = await res.json();
      setOrders(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Shiprocket orders...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between">
        <h3 className="font-bold text-gray-700">Recent Shipments</h3>
        <button onClick={fetchOrders} className="text-xs text-blue-600 hover:underline">Refresh</button>
      </div>
      <div className="divide-y divide-gray-100">
        {orders.map((o: any) => (
          <div key={o.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <p className="font-bold text-sm text-gray-900">#{o.channel_order_id || o.id}</p>
              <p className="text-xs text-gray-500">{o.customer_name} • {o.customer_phone}</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-bold uppercase">
                {o.status}
              </span>
              {o.shipments?.[0]?.awb && (
                <p className="text-xs text-gray-400 mt-1">AWB: {o.shipments[0].awb}</p>
              )}
            </div>
            <div className="flex gap-2">
              <ActionButton 
                label="Label" 
                icon={Printer} 
                onClick={() => window.open(o.shipments?.[0]?.label_url, '_blank')}
                disabled={!o.shipments?.[0]?.label_url}
              />
              <ActionButton 
                label="Invoice" 
                icon={FileText} 
                onClick={() => window.open(o.shipments?.[0]?.invoice_url, '_blank')}
                disabled={!o.shipments?.[0]?.invoice_url}
              />
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="p-8 text-center text-gray-400">No orders found.</div>}
      </div>
    </div>
  );
}

function CreateShipmentForm() {
  const [formData, setFormData] = useState({
    pickup_pincode: '452001', // Example default
    delivery_pincode: '',
    weight: '0.5',
    cod: true
  });
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkService = async () => {
    if (!formData.delivery_pincode) return alert('Enter delivery pincode');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shiprocket', {
        method: 'POST',
        body: JSON.stringify({
          action: 'check_serviceability',
          pickup: formData.pickup_pincode,
          delivery: formData.delivery_pincode,
          weight: formData.weight,
          cod: formData.cod
        })
      });
      const json = await res.json();
      // Shiprocket returns available_courier_companies array
      setCouriers(json.data?.available_courier_companies || []);
    } catch (e) {
      alert('Error checking serviceability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Check Courier Availability</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Pickup Pincode</label>
          <input 
            className="w-full border p-2 rounded" 
            value={formData.pickup_pincode}
            onChange={e => setFormData({...formData, pickup_pincode: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Delivery Pincode</label>
          <input 
            className="w-full border p-2 rounded" 
            value={formData.delivery_pincode}
            onChange={e => setFormData({...formData, delivery_pincode: e.target.value})}
            placeholder="e.g. 110001"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Weight (kg)</label>
          <input 
            className="w-full border p-2 rounded" 
            value={formData.weight}
            onChange={e => setFormData({...formData, weight: e.target.value})}
          />
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.cod}
              onChange={e => setFormData({...formData, cod: e.target.checked})}
            />
            <span className="text-sm font-medium">Is COD?</span>
          </label>
        </div>
      </div>

      <button 
        onClick={checkService}
        disabled={loading}
        className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Serviceability'}
      </button>

      {couriers.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="font-bold text-sm text-gray-600">Available Couriers:</h4>
          {couriers.map((c: any) => (
            <div key={c.courier_company_id} className="p-3 border rounded flex justify-between items-center bg-gray-50">
              <div>
                <p className="font-bold text-sm">{c.courier_name}</p>
                <p className="text-xs text-gray-500">Rating: {c.rating}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-700">₹ {c.rate}</p>
                <p className="text-xs text-gray-500">ETD: {c.etd}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrackAwb() {
  const [awb, setAwb] = useState('');
  const [trackData, setTrackData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!awb) return;
    setLoading(true);
    setTrackData(null);
    try {
      const res = await fetch('/api/admin/shiprocket', {
        method: 'POST',
        body: JSON.stringify({ action: 'track', awb })
      });
      const json = await res.json();
      setTrackData(json.tracking_data?.track_status?.[0] || null);
    } catch (e) {
      alert('Tracking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Track Shipment</h3>
      <div className="flex gap-2 mb-6">
        <input 
          className="flex-1 border p-2 rounded" 
          placeholder="Enter AWB Number"
          value={awb}
          onChange={e => setAwb(e.target.value)}
        />
        <button 
          onClick={handleTrack}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded font-bold"
        >
          {loading ? '...' : 'Track'}
        </button>
      </div>

      {trackData && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${trackData.status === 'DELIVERED' ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="font-bold text-lg uppercase">{trackData.status}</span>
          </div>
          <p className="text-sm text-gray-600">{trackData.current_status}</p>
          <p className="text-xs text-gray-400 mt-2">Location: {trackData.current_location}</p>
        </div>
      )}
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}