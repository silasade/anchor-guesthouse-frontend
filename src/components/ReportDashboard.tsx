import React, { useState, useEffect } from 'react';
import type { ReportData } from '../types/api';
import { api } from '../lib/api';
import { TrendingUp, Hotel, CheckCircle, XCircle, RefreshCw, Calendar, PieChart } from 'lucide-react';

export const ReportDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchReport = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/reports?period=${period}`);
      setReport(res.data.data.report);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch report analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header & Period Controls */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Administrative Period Reports</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              12:00 PM Cutoff Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time performance analytics for Guest House & Student Hostel</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Per {p}
            </button>
          ))}
          <button
            onClick={fetchReport}
            title="Refresh Report"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      {report && (
        <>
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Reservations</span>
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{report.summary.totalReservations}</div>
              <p className="text-[11px] text-slate-400 mt-1">Booked in selected {period}</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Checked-In Stays</span>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400">{report.summary.checkedInCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">Active checked-in guests/students</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Unreserved / Cancelled</span>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400">{report.summary.cancelledCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">Unreserved by admin or user</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue Generated</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-300">₦{report.summary.totalRevenue.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400 mt-1">Revenue for {period} timeframe</p>
            </div>
          </div>

          {/* Occupancy & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Occupancy Rate Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Hotel className="w-5 h-5 text-blue-400" /> Real-time Room Occupancy
              </h3>

              <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Occupancy Rate</span>
                  <div className="text-4xl font-extrabold text-white mt-1">
                    {report.roomOccupancy.occupancyRatePercentage}
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 flex items-center justify-center font-bold text-sm text-purple-300">
                  {report.roomOccupancy.occupancyRatePercentage}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-xs text-red-300">Occupied</span>
                  <div className="text-xl font-bold text-white mt-1">{report.roomOccupancy.occupiedRooms}</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs text-amber-300">Reserved</span>
                  <div className="text-xl font-bold text-white mt-1">{report.roomOccupancy.reservedRooms}</div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-emerald-300">Available</span>
                  <div className="text-xl font-bold text-white mt-1">{report.roomOccupancy.availableRooms}</div>
                </div>
              </div>
            </div>

            {/* Guest vs Student Breakdown Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-pink-400" /> Guest vs Student Breakdown
              </h3>

              <div className="space-y-4">
                {/* Guest Breakdown */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-blue-400">Guest Single Rooms</span>
                    <span className="text-xs font-bold text-white">
                      {report.categoryBreakdown.guest.reservationsCount} Reservations
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ₦{report.categoryBreakdown.guest.revenue.toLocaleString()}
                  </div>
                </div>

                {/* Student Breakdown */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-emerald-400">Student Double/Triple Bedspaces</span>
                    <span className="text-xs font-bold text-white">
                      {report.categoryBreakdown.student.reservationsCount} Reservations
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ₦{report.categoryBreakdown.student.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
