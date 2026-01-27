'use client';

import { useState } from 'react';
import { WORKFLOW_REQUIREMENTS } from '@/lib/workflow-requirements';
import { Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/order';

interface StatusUpdateModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export function StatusUpdateModal({ order, isOpen, onClose }: StatusUpdateModalProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine allowed transitions (simplified)
  const getNextStatuses = (current: string) => {
    switch (current) {
      case 'pending': return ['confirmed', 'cancelled'];
      case 'confirmed': return ['processing', 'cancelled'];
      case 'processing': return ['ready_for_pickup'];
      case 'ready_for_pickup': return ['dispatched'];
      case 'dispatched': return ['in_transit'];
      case 'in_transit': return ['delivery_attempt', 'delivered', 'rto_initiated'];
      
      // Handle numeric delivery attempts
      case 'delivery_attempt_1': return ['delivery_attempt', 'delivered', 'rto_initiated'];
      case 'delivery_attempt_2': return ['delivery_attempt', 'delivered', 'rto_initiated'];
      case 'delivery_attempt_3': return ['delivery_attempt', 'delivered', 'rto_initiated'];
      case 'delivery_attempt_4': return ['delivery_attempt', 'delivered', 'rto_initiated'];
      
      case 'rto_initiated': return ['rto_in_transit'];
      case 'rto_in_transit': return ['rto_received'];
      
      default: return [];
    }
  };

  const availableStatuses = getNextStatuses(order.current_status);

  // Handle Input Changes
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Logic to handle "delivery_attempt" generic status to specific "delivery_attempt_X"
      let finalStatus = selectedStatus;
      if (selectedStatus === 'delivery_attempt') {
        const nextAttempt = (order.delivery_attempts_count || 0) + 1;
        finalStatus = `delivery_attempt_${nextAttempt}`;
      }

      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_status: finalStatus,
          // We pass all form data as metadata or specific fields
          workflow_data: formData, 
          notify_customer: true
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update');
      }

      onClose(); // Close modal first
      
      // Force refresh to update UI with new data (like courier name)
      router.refresh(); 
      // Optionally reload to ensure fresh data if router.refresh() isn't enough
      // window.location.reload(); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current workflow requirement based on selected status
  // Handle delivery_attempt generic key
  const requirementKey = selectedStatus === 'delivery_attempt' ? 'delivery_attempt' : selectedStatus;
  const requirement = WORKFLOW_REQUIREMENTS[requirementKey] || WORKFLOW_REQUIREMENTS['default'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
            <p className="text-sm text-gray-500">Order #{order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Status Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Next Action</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setFormData({}); // Reset form on status change
              }}
              required
            >
              <option value="">-- Choose Status --</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Fields */}
          {selectedStatus && requirement && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                {requirement.label}
              </h3>
              
              {requirement.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      className="w-full p-2 border rounded bg-white text-sm"
                      onChange={e => handleInputChange(field.name, e.target.value)}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full p-2 border rounded text-sm h-20"
                      onChange={e => handleInputChange(field.name, e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full p-2 border rounded text-sm"
                      onChange={e => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedStatus}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Update'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}