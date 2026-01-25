'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Phone, Target, UserPlus, ArrowRight } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

export default function CRMDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your leads and team performance</p>
        </div>
        <div className="flex gap-3">
          {/* FIXED LINK BELOW: changed from /admin/crm/new to /admin/crm/leads/new */}
          <Link
            href="/admin/crm/leads/new" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Lead
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leads"
          value="0"
          icon={Users}
          iconClassName="bg-blue-600"
        />
        <StatsCard
          title="New Leads Today"
          value="0"
          icon={UserPlus}
          iconClassName="bg-green-600"
        />
        <StatsCard
          title="Calls Made"
          value="0"
          icon={Phone}
          iconClassName="bg-purple-600"
        />
        <StatsCard
          title="Conversion Rate"
          value="0%"
          icon={Target}
          iconClassName="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Leads</h2>
            <Link href="/admin/crm/leads" className="text-green-600 text-sm hover:underline flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="text-center text-gray-500 py-8">No leads yet</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Team Performance</h2>
            <Link href="/admin/crm/team" className="text-green-600 text-sm hover:underline flex items-center">
              View Team <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="text-center text-gray-500 py-8">No team data yet</div>
        </div>
      </div>
    </div>
  );
}