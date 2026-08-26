import { useState } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  useNavigate,
  RouterProvider,
} from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import { RoomCard } from './components/RoomCard';
import { BulkRoomGeneratorModal } from './components/BulkRoomGeneratorModal';
import { FrontDeskManager } from './components/FrontDeskManager';
import { ReportDashboard } from './components/ReportDashboard';
import { MyReservations } from './components/MyReservations';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { Room, Reservation } from './types/api';
import { api } from './lib/api';
import { Hotel, Filter, Building } from 'lucide-react';
import { Button } from './components/ui/button';

// 1. Root Layout Route
const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
    queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
    queryClient.invalidateQueries({ queryKey: ['all-reservations'] });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      <header className="sticky top-0 z-50 glass-nav px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg glow-blue">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">StayHub</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  TanStack Router
                </span>
              </div>
              <p className="text-xs text-slate-400">12:00 PM Noon Daily Checkout Policy</p>
            </div>
          </Link>

          {/* Navigation Links powered by TanStack Router */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            <Link
              to="/rooms"
              activeProps={{ className: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' }}
              inactiveProps={{ className: 'text-slate-400 hover:text-slate-200' }}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all"
            >
              Rooms Catalog
            </Link>

            <Link
              to="/my-reservations"
              activeProps={{ className: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' }}
              inactiveProps={{ className: 'text-slate-400 hover:text-slate-200' }}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all"
            >
              My Stays
            </Link>

            {(user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN') && (
              <Link
                to="/reception"
                activeProps={{ className: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md' }}
                inactiveProps={{ className: 'text-slate-400 hover:text-slate-200' }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all"
              >
                Reception Desk
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/reports"
                activeProps={{ className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' }}
                inactiveProps={{ className: 'text-slate-400 hover:text-slate-200' }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all"
              >
                Reports & Analytics
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg glow-emerald flex items-center gap-1.5 transition-all"
              >
                + Generate Rooms
              </button>
            )}

            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            ) : (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-blue-400">
                {user.name} ({user.role})
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        <Outlet />
      </main>

      <BulkRoomGeneratorModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={refreshAll}
      />

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        Guest House & Student Hostel System • Built with TanStack Router, TanStack Query & Shadcn UI
      </footer>
    </div>
  );
}

// 2. Rooms Route Component
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RoomsComponent,
});

const roomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rooms',
  component: RoomsComponent,
});

function RoomsComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery<Room[]>({
    queryKey: ['rooms', categoryFilter],
    queryFn: async () => {
      const url = categoryFilter !== 'ALL' ? `/rooms?category=${categoryFilter}` : '/rooms';
      const res = await api.get(url);
      return res.data.data.rooms;
    },
  });

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
    if (!user) {
      navigate({ to: '/login' });
      return;
    }
    await reserveMutation.mutateAsync({ roomId, checkInDate, checkOutDate, notes });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Hotel className="w-6 h-6 text-blue-400" /> Available Rooms Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">Single Guest Rooms & Double/Triple Student Bedspaces</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              categoryFilter === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Rooms
          </button>
          <button
            onClick={() => setCategoryFilter('GUEST')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              categoryFilter === 'GUEST' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Guest Single Rooms
          </button>
          <button
            onClick={() => setCategoryFilter('STUDENT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              categoryFilter === 'STUDENT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Bedspaces
          </button>
        </div>
      </div>

      {isLoadingRooms ? (
        <div className="py-20 text-center text-slate-400">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-2xl border border-slate-800">
          <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">No rooms found in catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} onReserve={handleReserve} />
          ))}
        </div>
      )}
    </div>
  );
}

// 3. Login Route Component
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => {
    const navigate = useNavigate();
    return (
      <LoginPage
        onNavigateRegister={() => navigate({ to: '/register' })}
        onLoginSuccess={() => navigate({ to: '/rooms' })}
      />
    );
  },
});

// 4. Register Route Component
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => {
    const navigate = useNavigate();
    return (
      <RegisterPage
        onNavigateLogin={() => navigate({ to: '/login' })}
        onRegisterSuccess={() => navigate({ to: '/rooms' })}
      />
    );
  },
});

// 5. My Reservations Route Component
const myReservationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-reservations',
  component: () => {
    const { user } = useAuth();
    const { data: myReservations = [], refetch } = useQuery<Reservation[]>({
      queryKey: ['my-reservations'],
      queryFn: async () => {
        const res = await api.get('/reservations/my-reservations');
        return res.data.data.reservations;
      },
      enabled: !!user,
    });

    return <MyReservations reservations={myReservations} onRefresh={() => refetch()} />;
  },
});

// 6. Reception Desk Route Component
const receptionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reception',
  component: () => {
    const { user } = useAuth();
    const { data: allReservations = [], refetch } = useQuery<Reservation[]>({
      queryKey: ['all-reservations'],
      queryFn: async () => {
        const res = await api.get('/reservations');
        return res.data.data.reservations;
      },
      enabled: !!user && (user.role === 'RECEPTIONIST' || user.role === 'ADMIN'),
    });

    return <FrontDeskManager reservations={allReservations} onRefresh={() => refetch()} />;
  },
});

// 7. Reports Route Component
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: () => <ReportDashboard />,
});

// Create Router Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  roomsRoute,
  loginRoute,
  registerRoute,
  myReservationsRoute,
  receptionRoute,
  reportsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
