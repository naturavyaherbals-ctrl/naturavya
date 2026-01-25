'use client';

// =====================================================
// SUPER ADMIN DASHBOARD - COMPLETE SYSTEM OVERVIEW
// =====================================================

import React from 'react';
import AdminDashboard from './AdminDashboard';

// Super Admin has all the features of Admin Dashboard plus additional controls
export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Super Admin Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-xl">👑</span>
        </div>
        <div>
          <p className="font-medium text-purple-900">Super Admin Mode</p>
          <p className="text-sm text-purple-700">You have full access to all system features and settings.</p>
        </div>
      </div>

      {/* Reuse Admin Dashboard */}
      <AdminDashboard />
    </div>
  );
}
