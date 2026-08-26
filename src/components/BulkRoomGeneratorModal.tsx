import React, { useState } from 'react';
import type { RoomCategory, RoomType } from '../types/api';
import { api } from '../lib/api';
import { Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BulkRoomGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkRoomGeneratorModal: React.FC<BulkRoomGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [numberOfRooms, setNumberOfRooms] = useState<number>(5);
  const [category, setCategory] = useState<RoomCategory>('STUDENT');
  const [roomType, setRoomType] = useState<RoomType>('DOUBLE');
  const [costPerNight, setCostPerNight] = useState<number>(5000);
  const [prefix, setPrefix] = useState<string>('S-');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: RoomCategory) => {
    setCategory(newCat);
    if (newCat === 'GUEST') {
      setRoomType('SINGLE');
      setPrefix('G-');
      setCostPerNight(15000);
    } else {
      setRoomType('DOUBLE');
      setPrefix('S-');
      setCostPerNight(5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!numberOfRooms || numberOfRooms < 1) {
      setErrorMsg('Please enter a valid number of rooms to generate.');
      return;
    }

    if (!costPerNight || costPerNight < 0) {
      setErrorMsg('Please enter a valid cost per night.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/rooms', {
        numberOfRooms,
        category,
        roomType,
        costPerNight,
        prefix,
      });

      setSuccessMsg(res.data.message || `Successfully generated ${numberOfRooms} rooms!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate rooms.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bulk Room Generator</h3>
              <p className="text-xs text-slate-400">Admin automated sequential room creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCategoryChange('GUEST')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  category === 'GUEST'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Guest Rooms (Single)
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('STUDENT')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  category === 'STUDENT'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Rooms (Bedspaces)
              </button>
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Room Type & Bedspaces</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {category === 'GUEST' ? (
                <option value="SINGLE">SINGLE (1 Bedspace - Guest Only)</option>
              ) : (
                <>
                  <option value="DOUBLE">DOUBLE (2 Bedspaces - Student Only)</option>
                  <option value="TRIPLE">TRIPLE (3 Bedspaces - Student Only)</option>
                </>
              )}
            </select>
          </div>

          {/* Number of Rooms to Generate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Number of Rooms to Enter</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={numberOfRooms}
                onChange={(e) => setNumberOfRooms(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cost Per Night (₦)</label>
              <input
                type="number"
                min={0}
                required
                value={costPerNight}
                onChange={(e) => setCostPerNight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Room Prefix */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Room Prefix Identifier</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. G- or S- or BlockA-"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Rooms will be numbered sequentially starting from <span className="font-semibold text-white">{prefix}101</span> to{' '}
              <span className="font-semibold text-white">{prefix}{100 + numberOfRooms}</span>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg glow-emerald transition-all"
            >
              {isSubmitting ? 'Generating...' : `Generate ${numberOfRooms} Rooms`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
