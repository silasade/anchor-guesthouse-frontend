import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/api';
import { Building2, UserCheck, ShieldCheck, Hotel, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBulkGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenBulkGenerator }) => {
  const { user, switchRolePreset, logout } = useAuth();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'GUEST', label: 'Guest', icon: <UserIcon className="w-4 h-4" />, color: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
    { role: 'STUDENT', label: 'Student', icon: <Hotel className="w-4 h-4" />, color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' },
    { role: 'RECEPTIONIST', label: 'Reception Desk', icon: <UserCheck className="w-4 h-4" />, color: 'bg-amber-600/20 text-amber-400 border-amber-500/30' },
    { role: 'ADMIN', label: 'Admin', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-purple-600/20 text-purple-400 border-purple-500/30' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('rooms')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg glow-blue">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">StayHub</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Hostel & Guest System
              </span>
            </div>
            <p className="text-xs text-slate-400">12:00 PM Noon Daily Checkout Policy</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'rooms'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rooms Catalog
          </button>
          
          <button
            onClick={() => setActiveTab('my-reservations')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'my-reservations'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Stays
          </button>

          {(user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('reception')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'reception'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reception Desk
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reports & Analytics
            </button>
          )}
        </div>

        {/* Quick Role Switcher Presets */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Switch View:
            </span>
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => switchRolePreset(r.role)}
                title={`Switch active context to ${r.label}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  user?.role === r.role
                    ? `${r.color} shadow-sm font-semibold scale-105`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {user?.role === 'ADMIN' && (
            <button
              onClick={onOpenBulkGenerator}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg glow-emerald flex items-center gap-1.5 transition-all"
            >
              + Generate Rooms
            </button>
          )}

          {user && (
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
