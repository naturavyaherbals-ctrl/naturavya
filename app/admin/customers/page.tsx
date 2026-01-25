'use client';

import React from 'react';
import { Users } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500">View and manage your customers</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No customers yet</h2>
        <p className="text-gray-500">Customers will appear here after they place orders.</p>
      </div>
    </div>
  );
}