import React from 'react';
import { Layers, ShieldAlert, TrendingUp, Ticket, User, Server, Clock } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  heldCount: number;
  remainingSeconds: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  heldCount,
  remainingSeconds,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { id: 'booking', label: 'Seat Map', icon: Layers },
    { id: 'concurrency', label: 'Concurrency Simulator', icon: ShieldAlert, highlight: true },
    { id: 'pricing', label: 'Dynamic Pricing', icon: TrendingUp },
    { id: 'user', label: 'My Bookings', icon: Ticket },
    { id: 'admin', label: 'Admin Console', icon: User },
    { id: 'architecture', label: 'Django Architecture', icon: Server },
  ];

  return (
    <header id="app-navbar" className="bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab('booking')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-[#3A86FF] flex items-center justify-center font-black text-xl text-white shadow-sm shadow-blue-500/20">
              TB
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Nexus<span className="text-[#3A86FF]">Booking</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PostgreSQL • Redis • Celery
              </span>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#3A86FF] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  } ${item.highlight && !isActive ? 'text-amber-700 font-semibold' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status / Active Hold Pill */}
          <div className="flex items-center space-x-3">
            {heldCount > 0 ? (
              <div
                id="active-hold-pill"
                onClick={() => setActiveTab('booking')}
                className="cursor-pointer flex items-center space-x-2 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{heldCount} Held</span>
                <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-bold">
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#00B894] animate-ping" />
                <span>Lock Engine Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-200 space-x-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-medium ${
                  isActive ? 'bg-[#3A86FF] text-white' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
