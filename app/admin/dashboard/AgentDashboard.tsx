'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/router';
import { useAuth } from '@/context/AuthContext';
import {
  Phone,
  PhoneCall,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  MessageCircle,
  User,
  Sparkles, // 👈 Added for Hot Leads
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Lead, TeamMemberStats } from '@/types';

export default function AgentDashboard() {
  const { user, teamMember } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingLeads, setPendingLeads] = useState<Lead[]>([]);
  const [followUpLeads, setFollowUpLeads] = useState<Lead[]>([]);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]); // 🚀 NEW STATE
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch stats and high-priority leads
      // We update the query to include 'hot' leads based on priority=2
      const [statsRes, leadsRes] = await Promise.all([
        fetch('/api/admin/dashboard/agent-stats'),
        fetch('/api/leads?assigned_to=me&limit=30'), // Fetch a larger batch to filter locally
      ]);

      const statsData = await statsRes.json();
      const leadsData = await leadsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (leadsData.success) {
        const allLeads = leadsData.data as any[];
        
        // 🚀 SEGMENTATION LOGIC
        // Hot Leads = Priority 2
        setHotLeads(allLeads.filter(l => l.priority === 2));
        
        // Follow-ups = status 'follow_up'
        setFollowUpLeads(allLeads.filter(l => l.status === 'follow_up'));
        
        // Pending = new or not picked
        setPendingLeads(allLeads.filter(l => ['new', 'not_picked'].includes(l.status)));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 p-4">
      {/* 1. Welcome Header */}
      <div className="bg-[#0f172a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Namaste, {user?.full_name?.split(' ')[0]}!</h1>
            <p className="text-slate-400 mt-2 font-medium">You have <span className="text-amber-400">{hotLeads.length} Hot Leads</span> waiting for conversion today.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-right min-w-[200px]">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Conversion Target</p>
            <div className="flex items-end justify-end gap-2">
                <span className="text-4xl font-black text-green-400">{stats?.leads_converted_today || 0}</span>
                <span className="text-lg font-bold text-slate-500 mb-1">/ 10</span>
            </div>
          </div>
        </div>
        {/* Abstract Background patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>

      {/* 2. Primary Action Row: HOT & PENDING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HOT LEADS CARD */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] border-2 border-red-50 shadow-xl shadow-red-100/50 flex flex-col">
           <div className="p-6 border-b border-red-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-50 rounded-xl text-red-600"><Flame size={20} /></div>
                 <h2 className="font-black uppercase tracking-tighter text-red-900">Hot Leads</h2>
              </div>
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full">{hotLeads.length}</span>
           </div>
           <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-red-50">
              {hotLeads.length > 0 ? (
                hotLeads.map(lead => <LeadQuickRow key={lead.id} lead={lead} type="hot" />)
              ) : (
                <div className="p-10 text-center text-slate-400 text-sm italic">No priority leads found.</div>
              )}
           </div>
           <Link href="/admin/crm/leads?priority=2" className="p-4 text-center text-xs font-bold text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest">View All Priority</Link>
        </div>

        {/* PENDING FOLLOW-UPS CARD */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] border-2 border-amber-50 shadow-xl shadow-amber-100/50 flex flex-col">
           <div className="p-6 border-b border-amber-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Clock size={20} /></div>
                 <h2 className="font-black uppercase tracking-tighter text-amber-900">Follow-ups</h2>
              </div>
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full">{followUpLeads.length}</span>
           </div>
           <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-amber-50">
              {followUpLeads.length > 0 ? (
                followUpLeads.map(lead => <LeadQuickRow key={lead.id} lead={lead} type="follow" />)
              ) : (
                <div className="p-10 text-center text-slate-400 text-sm italic">No follow-ups for today.</div>
              )}
           </div>
           <Link href="/admin/crm/leads?status=follow_up" className="p-4 text-center text-xs font-bold text-amber-600 hover:bg-amber-50 transition-colors uppercase tracking-widest">Manage Schedule</Link>
        </div>

        {/* STATS OVERVIEW */}
        <div className="lg:col-span-1 grid grid-cols-1 gap-4">
           <QuickStat label="Daily Call Log" value={stats?.leads_contacted || 0} icon={<PhoneCall />} color="blue" />
           <QuickStat label="Conversion Rate" value={`${stats?.conversion_rate || 0}%`} icon={<TrendingUp />} color="green" />
           <QuickStat label="Leads in Queue" value={pendingLeads.length} icon={<Target />} color="purple" />
        </div>
      </div>

      {/* 3. Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <NavButton label="New Leads" count={pendingLeads.length} href="/admin/crm/leads?status=new" icon={<Sparkles />} color="bg-blue-600" />
         <NavButton label="Follow Ups" count={followUpLeads.length} href="/admin/crm/leads?status=follow_up" icon={<Clock />} color="bg-amber-500" />
         <NavButton label="Hot Leads" count={hotLeads.length} href="/admin/crm/leads?priority=2" icon={<Flame />} color="bg-red-600" />
         <NavButton label="My Orders" href="/admin/orders" icon={<CheckCircle />} color="bg-green-600" />
      </div>
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function QuickStat({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 shadow-sm">
       <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
       <div>
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{label}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
       </div>
    </div>
  );
}

function NavButton({ label, count, href, icon, color }: any) {
  return (
    <Link href={href} className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 overflow-hidden">
       <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
          {icon}
       </div>
       <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          {count !== undefined && <p className="text-xs text-slate-400">{count} items pending</p>}
       </div>
       <ArrowUpRight className="absolute top-6 right-6 text-slate-200 group-hover:text-slate-400 transition-colors" size={20} />
    </Link>
  );
}

function LeadQuickRow({ lead, type }: { lead: Lead, type: 'hot' | 'follow' }) {
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 uppercase">
             {lead.full_name?.[0]}
          </div>
          <div>
             <p className="text-sm font-bold text-slate-900">{lead.full_name}</p>
             <p className="text-[10px] text-slate-400 font-medium">{lead.phone}</p>
          </div>
       </div>
       <div className="flex items-center gap-2">
          <a href={`tel:${lead.phone}`} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all">
             <Phone size={14} />
          </a>
          <Link href={`/admin/crm/leads/${lead.id}`} className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
             <ChevronRight size={14} />
          </Link>
       </div>
    </div>
  );
}

function DashboardSkeleton() {
    return <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-[2rem]" />
        <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-slate-100 rounded-[2rem]" />
            <div className="h-64 bg-slate-100 rounded-[2rem]" />
            <div className="h-64 bg-slate-100 rounded-[2rem]" />
        </div>
    </div>;
}
