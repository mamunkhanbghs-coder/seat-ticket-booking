import React from 'react';
import { BarChart3, Users, DollarSign, Clock, ShieldCheck, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { SeatItem, BookingEvent } from '../types';

interface AdminDashboardProps {
  seats: SeatItem[];
  event: BookingEvent;
  totalRevenue: number;
  onTriggerCeleryCleanup: () => void;
  isCleaning: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  seats,
  event,
  totalRevenue,
  onTriggerCeleryCleanup,
  isCleaning,
}) => {
  const total = seats.length;
  const booked = seats.filter((s) => s.status === 'BOOKED').length;
  const held = seats.filter((s) => s.status === 'HELD').length;
  const available = seats.filter((s) => s.status === 'AVAILABLE').length;

  const occupancyRate = total > 0 ? ((booked + held) / total) * 100 : 0;

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>High-Traffic Operations &amp; Telemetry</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Platform Administration Console</h2>
          <p className="text-sm text-slate-600 mt-1">
            Real-time PostgreSQL inventory status, Celery background worker controls, and live revenue tracking.
          </p>
        </div>

        {/* Celery manual trigger button */}
        <button
          id="btn-trigger-celery-cleanup"
          disabled={isCleaning}
          onClick={onTriggerCeleryCleanup}
          className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center space-x-2 transition-all shadow-2xs"
          title="Run the 30-second Celery Beat expired hold sweeper immediately"
        >
          <RefreshCw className={`w-4 h-4 text-amber-600 ${isCleaning ? 'animate-spin' : ''}`} />
          <span>{isCleaning ? 'Celery Sweeping...' : 'Run Celery Hold Sweeper'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase mb-2">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">${totalRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">Locked checkout guarantee</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase mb-2">
            <span>Occupancy Rate</span>
            <Users className="w-4 h-4 text-[#3A86FF]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{occupancyRate.toFixed(1)}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {booked} Booked • {held} Held
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase mb-2">
            <span>Active 5-Min Holds</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">{held} Seats</div>
          <div className="text-[11px] text-amber-700 mt-1">Temporary lock active</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase mb-2">
            <span>Remaining Available</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{available} Seats</div>
          <div className="text-[11px] text-slate-500 mt-1">Out of {total} total inventory</div>
        </div>
      </div>

      {/* Real-time Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#3A86FF]" />
            <h3 className="text-base font-bold text-slate-900">EventSeat Database Table (PostgreSQL Model)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Total Rows: {seats.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Row / Seat</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">Dynamic Price</th>
                <th className="px-4 py-3">Lock Status</th>
                <th className="px-4 py-3">Lock Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {seats.slice(0, 15).map((seat) => (
                <tr key={seat.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    {seat.row}{seat.number}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                      {seat.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">${seat.basePrice}</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-700">${seat.currentPrice}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        seat.status === 'BOOKED'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : seat.status === 'HELD'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {seat.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                    {seat.status === 'BOOKED'
                      ? 'Committed in PostgreSQL'
                      : seat.status === 'HELD'
                      ? 'SeatHold.expires_at (5 Min)'
                      : 'Free for Allocation'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
