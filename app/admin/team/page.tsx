'use client';

import React from 'react';
import { Users, UserPlus } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500">Manage your sales and support team</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No team members yet</h2>
        <p className="text-gray-500">Add team members to start managing your team.</p>
      </div>
    </div>
  );
}