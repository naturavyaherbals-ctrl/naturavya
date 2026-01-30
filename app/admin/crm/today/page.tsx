'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
} from 'lucide-react';

/* ================= TYPES ================= */

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  due_at: string | null;
  lead_id: string | null;
  order_id: string | null;
};

type TodayResponse = {
  role: 'agent' | 'manager' | 'superadmin';
};

/* ================= PAGE ================= */

export default function TodayPage() {
  const [role, setRole] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  /* ================= FETCH ================= */

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard/today', {
        credentials: 'include',
      });
      const json = await res.json();
      setRole(json.data?.role || null);

      if (json.data?.role === 'agent' || json.data?.role === 'manager') {
        const taskRes = await fetch('/api/tasks/my?status=pending');
        const taskJson = await taskRes.json();
        setTasks(taskJson.tasks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= COMPLETE TASK ================= */

  const completeTask = async (taskId: string) => {
    setCompleting(taskId);
    try {
      await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
      });
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(null);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  /* ================= AGENT / MANAGER ================= */

  if (role === 'agent' || role === 'manager') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Day – Tasks</h1>
            <p className="text-sm text-gray-600">
              Aaj ke pending kaam – ek click me complete
            </p>
          </div>
          <Link
            href="/admin/crm/leads?my=true"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"
          >
            Open My Leads
          </Link>
        </div>

        {/* ========== TASK LIST ========== */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Tasks ({tasks.length})
          </h2>

          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">
              🎉 No pending tasks. Good job!
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm">{t.title}</p>
                    {t.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t.description}
                      </p>
                    )}
                    <div className="text-[11px] text-gray-400 mt-1">
                      Priority:{' '}
                      <span className="font-semibold">
                        {t.priority || 'medium'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(t.lead_id || t.order_id) && (
                      <Link
                        href={
                          t.lead_id
                            ? `/admin/crm/leads/${t.lead_id}`
                            : `/admin/orders/${t.order_id}`
                        }
                        className="text-xs text-blue-600 underline"
                      >
                        Open
                      </Link>
                    )}

                    <button
                      onClick={() => completeTask(t.id)}
                      disabled={completing === t.id}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-60"
                    >
                      {completing === t.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= SUPERADMIN ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Company – Today Overview</h1>
      <p className="text-sm text-gray-600">
        Agent tasks, performance & delivery automation running
      </p>

      <div className="bg-white border rounded-xl p-6">
        <p className="text-sm text-gray-700">
          ✅ Auto task system active <br />
          ✅ Shiprocket webhook connected <br />
          ✅ Leads → Tasks → Completion tracked
        </p>

        <Link
          href="/admin/ai-ads"
          className="inline-flex items-center gap-2 mt-4 text-sm text-green-600 underline"
        >
          View AI Ads Control
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
