import React from 'react';
import type { Reservation } from '../types/api';
import { api } from '../lib/api';
import { Calendar, BedDouble, XCircle, Clock } from 'lucide-react';

interface MyReservationsProps {
  reservations: Reservation[];
  onRefresh: () => void;
}

export const MyReservations: React.FC<MyReservationsProps> = ({ reservations, onRefresh }) => {
  const handleUnreserve = async (id: string) => {
    if (!confirm('Are you sure you want to cancel / unreserve your stay?')) return;
    try {
      await api.post(`/reservations/${id}/unreserve`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-400" /> My Room Stays & Reservations
        </h2>
        <p className="text-xs text-slate-400 mt-1">View your current and past room bookings</p>
      </div>

      {reservations.length === 0 ? (
        <div className="py-16 text-center glass-card rounded-2xl border border-slate-800">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">You have no active or previous room reservations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reservations.map((res) => {
            const roomObj = typeof res.room === 'object' ? res.room : null;

            return (
              <div
                key={res._id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      Room {roomObj?.roomNumber || 'N/A'}
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
                    <div className="text-sm font-semibold text-white">Category: {res.userCategory}</div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <BedDouble className="w-3.5 h-3.5" /> 12:00 PM Noon Cutoff Policy
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-in Date:</span>
                      <span className="font-semibold text-white">{new Date(res.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-out (12 PM):</span>
                      <span className="font-semibold text-white">{new Date(res.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Total Cost ({res.totalNights} nights):</span>
                      <span className="font-bold text-emerald-400 text-sm">₦{res.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {res.status === 'RESERVED' && (
                  <button
                    onClick={() => handleUnreserve(res._id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                    Cancel Reservation
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
