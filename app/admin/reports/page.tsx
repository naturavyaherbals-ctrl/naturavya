'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500">Analyze your business performance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports coming soon</h2>
        <p className="text-gray-500">Detailed analytics and reports will be available here.</p>
      </div>
    </div>
  );
}