import React, { useState } from 'react';
import type { Reservation } from '../types/api';
import { api } from '../lib/api';
import { UserCheck, LogOut as CheckOutIcon, XCircle, Search, Clock, CheckCircle2 } from 'lucide-react';

interface FrontDeskManagerProps {
  reservations: Reservation[];
  onRefresh: () => void;
}

export const FrontDeskManager: React.FC<FrontDeskManagerProps> = ({ reservations, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleCheckIn = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.post(`/reservations/${id}/check-in`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.post(`/reservations/${id}/check-out`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnreserve = async (id: string) => {
    if (!confirm('Are you sure you want to unreserve / cancel this room reservation?')) return;
    setActionLoadingId(id);
    try {
      await api.post(`/reservations/${id}/unreserve`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unreserve failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const roomObj = typeof r.room === 'object' ? r.room : null;
    const userObj = typeof r.user === 'object' ? r.user : null;
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      (roomObj?.roomNumber && roomObj.roomNumber.toLowerCase().includes(search)) ||
      (userObj?.name && userObj.name.toLowerCase().includes(search)) ||
      (userObj?.email && userObj.email.toLowerCase().includes(search));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" /> Front Desk Receptionist Operations
          </h2>
          <p className="text-xs text-slate-400">Perform check-ins, check-outs, and unreserve rooms with 12:00 PM cutoff tracking</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search guest name or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="RESERVED">Reserved</option>
            <option value="CHECKED_IN">Checked-In</option>
            <option value="CHECKED_OUT">Checked-Out</option>
            <option value="CANCELLED">Cancelled / Unreserved</option>
          </select>
        </div>
      </div>

      {/* Reservations Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center glass-card rounded-2xl border border-slate-800">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No reservations match the selected filter.</p>
          </div>
        ) : (
          filtered.map((res) => {
            const roomObj = typeof res.room === 'object' ? res.room : null;
            const userObj = typeof res.user === 'object' ? res.user : null;

            return (
              <div
                key={res._id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      Room {roomObj?.roomNumber || 'N/A'} ({res.userCategory})
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        res.status === 'CHECKED_IN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : res.status === 'RESERVED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : res.status === 'CHECKED_OUT'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-white">{userObj?.name || 'Guest / Student'}</h4>
                    <p className="text-xs text-slate-400">{userObj?.email}</p>
                    {userObj?.studentId && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                        ID: {userObj.studentId}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs text-slate-300 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-in:</span>
                      <span className="font-semibold text-white">{new Date(res.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-out (12 PM):</span>
                      <span className="font-semibold text-white">{new Date(res.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Total ({res.totalNights} nights):</span>
                      <span className="font-bold text-emerald-400">₦{res.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  {res.status === 'RESERVED' && (
                    <button
                      onClick={() => handleCheckIn(res._id)}
                      disabled={actionLoadingId === res._id}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Check-In
                    </button>
                  )}

                  {res.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleCheckOut(res._id)}
                      disabled={actionLoadingId === res._id}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1"
                    >
                      <CheckOutIcon className="w-3.5 h-3.5" />
                      Check-Out
                    </button>
                  )}

                  {(res.status === 'RESERVED' || res.status === 'CHECKED_IN') && (
                    <button
                      onClick={() => handleUnreserve(res._id)}
                      disabled={actionLoadingId === res._id}
                      title="Admin / Receptionist Unreserve Room"
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Unreserve
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
