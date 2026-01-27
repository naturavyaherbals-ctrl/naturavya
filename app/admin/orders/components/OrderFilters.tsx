'use client';

import { useState } from 'react';
import { OrderStatus } from '@/types/order';
import { STATUS_CONFIG } from '@/types/status';
import { Search, Filter, X, Calendar } from 'lucide-react';

interface OrderFiltersProps {
  filters: {
    status?: OrderStatus;
    search: string;
    isRTO?: boolean;
  };
  onFilterChange: (filters: Partial<OrderFiltersProps['filters']>) => void;
}

export function OrderFilters({ filters, onFilterChange }: OrderFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusGroups = {
    active: ['pending', 'confirmed', 'processing', 'dispatched', 'in_transit', 'out_for_delivery'],
    delivery: ['delivery_attempt_1', 'delivery_attempt_2', 'delivery_attempt_3', 'delivery_attempt_4', 'delivery_attempt_5'],
    completed: ['delivered'],
    rto: ['rto_initiated', 'rto_in_transit', 'rto_received'],
    cancelled: ['cancelled', 'refunded'],
  };

  const clearFilters = () => {
    onFilterChange({
      status: undefined,
      search: '',
      isRTO: undefined,
    });
  };

  const hasActiveFilters = filters.status || filters.search || filters.isRTO !== undefined;

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search by order number, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange({ status: undefined })}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                !filters.status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange({ status: 'in_transit' })}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                filters.status === 'in_transit'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => onFilterChange({ isRTO: true })}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                filters.isRTO
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              RTO
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Hide Filters' : 'More Filters'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) =>
                    onFilterChange({
                      status: (e.target.value as OrderStatus) || undefined,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <optgroup label="Active Orders">
                    {statusGroups.active.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status as OrderStatus].label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Delivery Attempts">
                    {statusGroups.delivery.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status as OrderStatus].label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="RTO">
                    {statusGroups.rto.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status as OrderStatus].label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Completed">
                    {statusGroups.completed.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status as OrderStatus].label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Cancelled">
                    {statusGroups.cancelled.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status as OrderStatus].label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* RTO Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <select
                  value={
                    filters.isRTO === undefined
                      ? ''
                      : filters.isRTO
                      ? 'rto'
                      : 'normal'
                  }
                  onChange={(e) =>
                    onFilterChange({
                      isRTO:
                        e.target.value === ''
                          ? undefined
                          : e.target.value === 'rto',
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Orders</option>
                  <option value="normal">Normal Orders</option>
                  <option value="rto">RTO Orders</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}