import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RoomCard } from './components/RoomCard';
import { BulkRoomGeneratorModal } from './components/BulkRoomGeneratorModal';
import { FrontDeskManager } from './components/FrontDeskManager';
import { ReportDashboard } from './components/ReportDashboard';
import { MyReservations } from './components/MyReservations';
import type { Room, Reservation } from './types/api';
import { api } from './lib/api';
import { Hotel, Filter, Sparkles, Building } from 'lucide-react';

const queryClient = new QueryClient();

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('rooms');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);

  // Fetch Rooms via TanStack Query
  const { data: rooms = [], isLoading: isLoadingRooms, refetch: refetchRooms } = useQuery<Room[]>({
    queryKey: ['rooms', categoryFilter],
    queryFn: async () => {
      const url = categoryFilter !== 'ALL' ? `/rooms?category=${categoryFilter}` : '/rooms';
      const res = await api.get(url);
      return res.data.data.rooms;
    },
  });

  // Fetch User's Reservations
  const { data: myReservations = [], refetch: refetchMyReservations } = useQuery<Reservation[]>({
    queryKey: ['my-reservations'],
    queryFn: async () => {
      const res = await api.get('/reservations/my-reservations');
      return res.data.data.reservations;
    },
    enabled: !!user,
  });

  // Fetch All Reservations (Receptionist / Admin)
  const { data: allReservations = [], refetch: refetchAllReservations } = useQuery<Reservation[]>({
    queryKey: ['all-reservations'],
    queryFn: async () => {
      const res = await api.get('/reservations');
      return res.data.data.reservations;
    },
    enabled: !!user && (user.role === 'RECEPTIONIST' || user.role === 'ADMIN'),
  });

  // Reserve Room Mutation
  const reserveMutation = useMutation({
    mutationFn: async ({
      roomId,
      checkInDate,
      checkOutDate,
      notes,
    }: {
      roomId: string;
      checkInDate: string;
      checkOutDate: string;
      notes?: string;
    }) => {
      const res = await api.post('/reservations', {
        roomId,
        checkInDate,
        checkOutDate,
        notes,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['all-reservations'] });
    },
  });

  const handleReserve = async (
    roomId: string,
    checkInDate: string,
    checkOutDate: string,
    notes?: string
  ) => {
    await reserveMutation.mutateAsync({ roomId, checkInDate, checkOutDate, notes });
  };

  const refreshAll = () => {
    refetchRooms();
    refetchMyReservations();
    refetchAllReservations();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBulkGenerator={() => setIsBulkModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* User Context Banner */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Active Persona: <span className="text-blue-400 font-bold">{user?.name}</span> ({user?.role})
              </div>
              <p className="text-xs text-slate-400">
                {user?.role === 'GUEST' && 'Single Guest rooms available for booking.'}
                {user?.role === 'STUDENT' && 'Double and Triple Student bedspaces available.'}
                {user?.role === 'RECEPTIONIST' && 'Receptionist Front Desk Check-in/Out access enabled.'}
                {user?.role === 'ADMIN' && 'Admin Bulk Room Generator & Analytics Reports access enabled.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Checkout Policy:</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-amber-300">
              12:00 PM Noon
            </span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            {/* Catalog Filter Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Hotel className="w-6 h-6 text-blue-400" /> Available Rooms Catalog
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Single Guest Rooms & Double/Triple Student Bedspaces
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <Filter className="w-4 h-4 text-slate-500 ml-2" />
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoryFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Rooms
                </button>
                <button
                  onClick={() => setCategoryFilter('GUEST')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoryFilter === 'GUEST'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Guest Single Rooms
                </button>
                <button
                  onClick={() => setCategoryFilter('STUDENT')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoryFilter === 'STUDENT'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student Bedspaces
                </button>
              </div>
            </div>

            {/* Room Grid */}
            {isLoadingRooms ? (
              <div className="py-20 text-center text-slate-400">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="py-20 text-center glass-card rounded-2xl border border-slate-800">
                <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium text-sm">No rooms found in catalog.</p>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white shadow-lg glow-emerald"
                  >
                    + Generate Rooms Now
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room._id} room={room} onReserve={handleReserve} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-reservations' && (
          <MyReservations reservations={myReservations} onRefresh={refreshAll} />
        )}

        {activeTab === 'reception' && (
          <FrontDeskManager reservations={allReservations} onRefresh={refreshAll} />
        )}

        {activeTab === 'reports' && <ReportDashboard />}

      </main>

      {/* Bulk Generator Modal */}
      <BulkRoomGeneratorModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={refreshAll}
      />

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        Guest House & Student Hostel Reservation System • Silas • Powered by React, Vite, TanStack & Tailwind
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
