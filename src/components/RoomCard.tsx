import React, { useState } from 'react';
import type { Room } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { BedDouble, CalendarCheck, AlertCircle } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onReserve: (roomId: string, checkInDate: string, checkOutDate: string, notes?: string) => Promise<void>;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onReserve }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGuestRoom = room.category === 'GUEST';
  const isStudentRoom = room.category === 'STUDENT';

  // Restriction checks
  const isStudentOnlyRoom = room.roomType === 'DOUBLE' || room.roomType === 'TRIPLE' || isStudentRoom;
  const canUserBook =
    (user?.role === 'GUEST' && isGuestRoom) ||
    (user?.role === 'STUDENT' && isStudentOnlyRoom) ||
    user?.role === 'ADMIN' ||
    user?.role === 'RECEPTIONIST';

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!checkInDate || !checkOutDate) {
      setErrorMsg('Please select both check-in and check-out dates.');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReserve(room._id, checkInDate, checkOutDate, notes);
      setShowModal(false);
      setCheckInDate('');
      setCheckOutDate('');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to complete reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl group">
        <div>
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                isGuestRoom
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isGuestRoom ? 'Single Guest Room' : `${room.roomType} Student Bedspace`}
            </span>

            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                room.status === 'AVAILABLE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : room.status === 'RESERVED'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : room.status === 'OCCUPIED'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'AVAILABLE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {room.status}
            </span>
          </div>

          {/* Room Number & Details */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
              Room {room.roomNumber}
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-slate-400" />
                {room.totalBedspaces} {room.totalBedspaces === 1 ? 'Bedspace' : 'Bedspaces'}
              </span>
              <span>•</span>
              <span className="text-slate-300">12:00 PM Noon Cutoff</span>
            </div>
          </div>
        </div>

        {/* Pricing & Action Button */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide">Rate</span>
            <div className="text-xl font-bold text-white">
              ₦{room.costPerNight.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">/ night</span>
            </div>
          </div>

          {room.status === 'AVAILABLE' && (
            <button
              onClick={() => setShowModal(true)}
              className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center gap-1.5 ${
                canUserBook
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white glow-blue'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              Reserve Room
            </button>
          )}
        </div>

        {!canUserBook && room.status === 'AVAILABLE' && (
          <p className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {isStudentOnlyRoom
              ? 'Only students can reserve double and triple bedspace rooms.'
              : 'Only guests can reserve single rooms.'}
          </p>
        )}
      </div>

      {/* Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Reserve Room {room.roomNumber}</h3>
                <p className="text-xs text-slate-400">{room.category} • ₦{room.costPerNight.toLocaleString()} / night</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Check-in Date</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Check-out Date (12:00 PM Noon Cutoff)</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Expected arrival time, special requests..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                💡 <span className="font-semibold">Cashless Policy:</span> No online payment required. Pay upon arrival at the Front Desk during check-in.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg glow-blue transition-all"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
