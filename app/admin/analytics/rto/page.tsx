'use client';

import React, { useEffect, useState } from 'react';
import {
  PackageX,
  PackageCheck,
  Percent,
  IndianRupee,
  RefreshCw,
  Calendar,
  Truck,
  MapPin,
  Users,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

interface CourierRow {
  courier: string | null;
  total_orders: number | null;
  rto_orders: number | null;
  rto_rate_pct: number | null;
  total_value: number | null;
  rto_value: number | null;
}

interface PincodeRow {
  pincode: string | null;
  total_orders: number | null;
  rto_orders: number | null;
  rto_rate_pct: number | null;
  total_value: number | null;
  rto_value: number | null;
}

interface AgentRow {
  agent_id: string | null;
  agent_name: string | null;
  total_orders: number | null;
  rto_orders: number | null;
  rto_rate_pct: number | null;
  total_value: number | null;
  rto_value: number | null;
}

interface Totals {
  total_orders: number | null;
  rto_orders: number | null;
  total_value: number | null;
  rto_value: number | null;
  overall_rto_rate_pct: number | null;
}

export default function RtoAnalyticsPage() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [loading, setLoading] = useState(true);
  const [courierRows, setCourierRows] = useState<CourierRow[]>([]);
  const [pincodeRows, setPincodeRows] = useState<PincodeRow[]>([]);
  const [agentRows, setAgentRows] = useState<AgentRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('start_date', startDate);
      params.set('end_date', endDate);

      const res = await fetch(
        `/api/admin/analytics/rto?${params.toString()}`
      );
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        setCourierRows(d.by_courier || []);
        setPincodeRows(d.by_pincode || []);
        setAgentRows(d.by_agent || []);
        setTotals(d.totals || null);
      }
    } catch (e) {
      console.error('RTO analytics error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const safePct = (v: number | null | undefined) =>
    typeof v === 'number' && !isNaN(v) ? v.toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            RTO Performance
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Courier, pincode aur agent level par RTO ka breakdown
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
        {totals && (
          <p className="ml-auto text-xs text-gray-500">
            Showing orders from{' '}
            <span className="font-medium">{startDate}</span> to{' '}
            <span className="font-medium">{endDate}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Orders"
              value={totals?.total_orders ?? 0}
              icon={PackageCheck}
              color="bg-blue-50 border-blue-200 text-blue-800"
            />
            <SummaryCard
              title="RTO Orders"
              value={totals?.rto_orders ?? 0}
              icon={PackageX}
              color="bg-red-50 border-red-200 text-red-800"
            />
            <SummaryCard
              title="Overall RTO Rate"
              value={
                totals
                  ? `${safePct(totals.overall_rto_rate_pct)}%`
                  : '0.00%'
              }
              icon={Percent}
              color="bg-amber-50 border-amber-200 text-amber-800"
            />
            <SummaryCard
              title="Revenue Lost to RTO"
              value={
                totals
                  ? formatCurrency(totals.rto_value || 0)
                  : '₹0'
              }
              icon={IndianRupee}
              color="bg-emerald-50 border-emerald-200 text-emerald-800"
            />
          </div>

          {/* Courier + Agent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By courier */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-700" />
                  By Courier
                </h2>
                <p className="text-[11px] text-gray-500">
                  Sorted by highest RTO %
                </p>
              </div>
              {courierRows.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No orders in this date range.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>Courier</Th>
                        <Th className="text-right">Orders</Th>
                        <Th className="text-right">RTO</Th>
                        <Th className="text-right">RTO %</Th>
                        <Th className="text-right">Value</Th>
                        <Th className="text-right">RTO Value</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {courierRows.map((row, idx) => (
                        <tr
                          key={`${row.courier || 'unknown'}-${idx}`}
                          className="hover:bg-gray-50"
                        >
                          <Td>{row.courier || 'Unknown'}</Td>
                          <Td className="text-right">
                            {row.total_orders ?? 0}
                          </Td>
                          <Td className="text-right">
                            {row.rto_orders ?? 0}
                          </Td>
                          <Td className="text-right">
                            {safePct(row.rto_rate_pct)}%
                          </Td>
                          <Td className="text-right">
                            {formatCurrency(row.total_value || 0)}
                          </Td>
                          <Td className="text-right">
                            {formatCurrency(row.rto_value || 0)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* By agent */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700" />
                  By Agent
                </h2>
                <p className="text-[11px] text-gray-500">
                  Use for coaching & QC
                </p>
              </div>
              {agentRows.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No agent orders in this date range.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>Agent</Th>
                        <Th className="text-right">Orders</Th>
                        <Th className="text-right">RTO</Th>
                        <Th className="text-right">RTO %</Th>
                        <Th className="text-right">Value</Th>
                        <Th className="text-right">RTO Value</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {agentRows.map((row, idx) => (
                        <tr
                          key={`${row.agent_id || 'na'}-${idx}`}
                          className="hover:bg-gray-50"
                        >
                          <Td>{row.agent_name || 'Unknown'}</Td>
                          <Td className="text-right">
                            {row.total_orders ?? 0}
                          </Td>
                          <Td className="text-right">
                            {row.rto_orders ?? 0}
                          </Td>
                          <Td className="text-right">
                            {safePct(row.rto_rate_pct)}%
                          </Td>
                          <Td className="text-right">
                            {formatCurrency(row.total_value || 0)}
                          </Td>
                          <Td className="text-right">
                            {formatCurrency(row.rto_value || 0)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* By pincode */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-700" />
                By Pincode (top risky)
              </h2>
            </div>
            {pincodeRows.length === 0 ? (
              <p className="text-sm text-gray-500">
                No pincode data in this date range.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[420px]">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <Th>Pincode</Th>
                      <Th className="text-right">Orders</Th>
                      <Th className="text-right">RTO</Th>
                      <Th className="text-right">RTO %</Th>
                      <Th className="text-right">Value</Th>
                      <Th className="text-right">RTO Value</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pincodeRows.map((row, idx) => (
                      <tr
                        key={`${row.pincode || 'unknown'}-${idx}`}
                        className="hover:bg-gray-50"
                      >
                        <Td>{row.pincode || 'Unknown'}</Td>
                        <Td className="text-right">
                          {row.total_orders ?? 0}
                        </Td>
                        <Td className="text-right">
                          {row.rto_orders ?? 0}
                        </Td>
                        <Td className="text-right">
                          {safePct(row.rto_rate_pct)}%
                        </Td>
                        <Td className="text-right">
                          {formatCurrency(row.total_value || 0)}
                        </Td>
                        <Td className="text-right">
                          {formatCurrency(row.rto_value || 0)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 flex items-center gap-3 ${color}`}
    >
      <div className="p-2 rounded-lg bg-white/60">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium opacity-80">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase',
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-3 py-2 text-gray-900', className)}>{children}</td>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}