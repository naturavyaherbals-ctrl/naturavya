'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Phone,
  PhoneCall,
  Clock,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  MessageCircle,
  Flame,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import type { Lead } from '@/types';

export default function AgentDashboard() {
  const { user, teamMember } = useAuth();

  const [tasks, setTasks] = useState<Lead[]>([]);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<Lead[]>([]);
  const [pending, setPending] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamMember?.id) return;
    loadTasks();
  }, [teamMember?.id]);

  const loadTasks = async () => {
    setLoading(true);
    const res = await fetch('/api/agent/tasks', {
      headers: {
        'x-agent-id': teamMember!.id,
      },
    });

    const json = await res.json();
    if (json.success) {
      setTasks(json.data);
      setHotLeads(json.data.filter((l: Lead) => l.temperature === 'hot'));
      setFollowUps(json.data.filter((l: Lead) => l.status === 'follow_up'));
      setPending(
        json.data.filter((l: Lead) =>
          ['new', 'not_picked'].includes(l.status)
        )
      );
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="bg-slate-900 text-white rounded-3xl p-8">
        <h1 className="text-3xl font-bold">
          Namaste, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-2">
          {hotLeads.length} hot leads need your attention today
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LeadCard title="🔥 Hot Leads" leads={hotLeads} />
        <LeadCard title="⏰ Follow Ups" leads={followUps} />
        <LeadCard title="✨ New / Pending" leads={pending} />
      </div>
    </div>
  );
}

function LeadCard({ title, leads }: { title: string; leads: Lead[] }) {
  return (
    <div className="bg-white rounded-3xl border shadow-sm">
      <div className="p-5 border-b font-bold">{title}</div>
      <div className="divide-y max-h-[420px] overflow-y-auto">
        {leads.length === 0 && (
          <div className="p-6 text-sm text-gray-400 text-center">
            No leads here
          </div>
        )}
        {leads.map((lead) => (
          <div key={lead.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {lead.full_name || lead.phone}
              </p>
              <p className="text-xs text-gray-400">
                {lead.temperature.toUpperCase()} • Score {lead.score}
              </p>
              {lead.ai_suggested_message && (
                <p className="mt-1 text-xs text-green-700">
                  🤖 {lead.ai_suggested_message.slice(0, 80)}...
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="p-2 rounded-lg bg-green-100 text-green-700"
              >
                <Phone size={14} />
              </a>
              <Link
                href={`/admin/crm/leads/${lead.id}`}
                className="p-2 rounded-lg bg-slate-100"
              >
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
