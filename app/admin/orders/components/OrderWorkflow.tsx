'use client';

import { useState } from 'react';
import { WORKFLOW_CONFIG, OrderStatus } from '@/lib/workflow-config';
import { UserPlus, ArrowRight, Truck, AlertTriangle, Loader2 } from 'lucide-react';

interface OrderWorkflowProps {
  order: any;
  onUpdate: () => void;
  teamMembers: any[]; // List of agents/managers for assignment
}

export function OrderWorkflow({ order, onUpdate, teamMembers }: OrderWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [inputModal, setInputModal] = useState<{ type: string; target: string; label: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState('');

  const currentStep = WORKFLOW_CONFIG[order.current_status as OrderStatus] || WORKFLOW_CONFIG['pending'];

  // Handle Status Update
  const handleStatusUpdate = async (targetStatus: string, metaData: any = {}) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          orderId: order.id,
          data: {
            newStatus: targetStatus,
            metaData: { ...metaData, oldStatus: order.current_status }
          }
        })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      setInputModal(null);
      setInputValue('');
      setNotes('');
      onUpdate(); // Refresh parent
    } catch (err) {
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  // Handle Assignment
  const handleAssign = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          orderId: order.id,
          data: { assignedToId: userId }
        })
      });
      if (!res.ok) throw new Error('Failed to assign');
      setShowAssignModal(false);
      onUpdate();
    } catch (err) {
      alert('Error assigning order');
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle button click
  const onActionClick = (action: any) => {
    if (action.requiresInput) {
      setInputModal({ type: action.inputField, target: action.targetStatus, label: action.label });
    } else {
      if (confirm(`Are you sure you want to ${action.label}?`)) {
        handleStatusUpdate(action.targetStatus);
      }
    }
  };

  // Assign Modal Component (Inline)
  const AssignModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-bold mb-4">Assign Order</h3>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {teamMembers.map(member => (
            <button
              key={member.id}
              onClick={() => handleAssign(member.user_id || member.id)}
              className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
              {order.assigned_to === (member.user_id || member.id) && <span className="text-green-600 text-xs">Current</span>}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAssignModal(false)} className="mt-4 w-full border p-2 rounded">Cancel</button>
      </div>
    </div>
  );

  // Input Modal (for Tracking / NDR Reason)
  const InputModalComponent = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-bold mb-4">{inputModal?.label}</h3>
        
        {inputModal?.type === 'tracking' && (
          <input 
            className="w-full border p-2 rounded mb-2" 
            placeholder="Enter Tracking Number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        )}

        {inputModal?.type === 'ndr_reason' && (
          <select 
            className="w-full border p-2 rounded mb-2"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          >
            <option value="">Select Reason</option>
            <option value="Customer Unavailable">Customer Unavailable</option>
            <option value="Incorrect Address">Incorrect Address</option>
            <option value="Customer Refused">Customer Refused</option>
            <option value="Phone Unreachable">Phone Unreachable</option>
          </select>
        )}

        <textarea 
          className="w-full border p-2 rounded mb-4" 
          placeholder="Add Notes (Optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <div className="flex gap-2">
          <button onClick={() => setInputModal(null)} className="flex-1 border p-2 rounded">Cancel</button>
          <button 
            onClick={() => handleStatusUpdate(inputModal!.target, { [inputModal!.type === 'tracking' ? 'tracking' : 'reason']: inputValue, notes })}
            disabled={!inputValue && inputModal?.type !== 'rto_reason'} 
            className="flex-1 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Order Workflow</h2>
          <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStep.color}`}>
            <currentStep.icon className="w-4 h-4 mr-2" />
            {currentStep.label}
          </div>
        </div>
        
        {/* Assignment Button */}
        <button 
          onClick={() => setShowAssignModal(true)}
          className="flex items-center text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          {order.assigned_to ? 'Reassign' : 'Assign to Agent'}
        </button>
      </div>

      {/* Progress Bar (Visual) */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-500"
          style={{ width: getProgressWidth(order.current_status) }}
        ></div>
      </div>

      {/* Next Actions */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-700">Available Actions:</p>
        <div className="flex flex-wrap gap-3">
          {currentStep.nextActions.length > 0 ? (
            currentStep.nextActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onActionClick(action)}
                disabled={loading}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action.label.includes('Cancel') || action.label.includes('Failed') 
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {action.label}
                {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-80" />}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No further actions available for this status.</p>
          )}
        </div>
      </div>

      {showAssignModal && <AssignModal />}
      {inputModal && <InputModalComponent />}
    </div>
  );
}

// Helper for progress bar
function getProgressWidth(status: string) {
  const map: any = {
    pending: '10%', confirmed: '20%', processing: '40%', 
    ready_for_pickup: '50%', dispatched: '60%', in_transit: '80%', 
    delivered: '100%', ndr: '85%', rto: '100%', cancelled: '0%'
  };
  return map[status] || '0%';
}