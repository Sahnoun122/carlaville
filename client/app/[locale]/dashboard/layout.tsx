"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  LogOut,
  Car,
  History,
  LayoutDashboard,
  User as UserIcon,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('carlaville_token');
    const userData = localStorage.getItem('carlaville_user');

    if (!token || !userData) {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(userData));
      setLoading(false);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('carlaville_token');
    localStorage.removeItem('carlaville_user');
    router.push('/auth/login');
  }

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`group flex items-center justify-between w-full p-4 rounded-2xl font-black transition-all duration-300 ${isActive
          ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 translate-x-1'
          : 'text-gray-400 hover:text-neutral-900 border-transparent hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center gap-4">
          <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-red-600' : ''}`} />
          <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
        </div>
        {isActive && <ChevronRight className="w-4 h-4 text-red-600 animate-in fade-in slide-in-from-left-2" />}
      </Link>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-8 border-red-50 border-t-red-600 rounded-full animate-spin mb-6"></div>
      <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px]">Chargement sécurisé...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row font-sans text-neutral-900 selection:bg-red-100 italic selection:text-red-900">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 bg-white border-b border-gray-100 sticky top-0 z-[60]">
        <Link href="/" className="group">
          <span className="text-2xl font-black tracking-tighter text-neutral-900">Carlaville<span className="text-red-600">.</span></span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-neutral-900 text-white rounded-2xl shadow-lg shadow-neutral-900/20 active:scale-90 transition-all"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[45] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 w-[300px] bg-gray-50 border-l border-gray-100 shrink-0 flex flex-col shadow-2xl z-50
        transition-transform duration-500 ease-out md:relative md:translate-x-0 md:w-80 md:shadow-[20px_0_60px_rgba(0,0,0,0.02)]
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>

        {/* Brand Area */}
        <div className="p-10 border-b border-gray-50 flex flex-col items-center md:items-start">
          <Link href="/" className="mb-12 block group">
            <span className="text-3xl font-black tracking-tighter text-neutral-900 group-hover:text-red-600 transition-colors">Carlaville<span className="text-red-600 group-hover:text-neutral-900 transition-colors">.</span></span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-16 h-16 bg-red-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-2xl font-black relative z-10">{user?.name ? user.name.charAt(0).toUpperCase() : 'C'}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></div>
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900 tracking-tight leading-tight">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Client Vérifié</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4 ml-4">Pilotage</p>
          <NavLink href="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink href="/dashboard/reservations" icon={Calendar} label="Mes Réservations" />
          </div>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink href="/dashboard/history" icon={History} label="Historique" />
          </div>

          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mt-10 mb-4 ml-4">Services</p>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink href="/cars" icon={Car} label="Catalogue Flotte" />
          </div>
        </nav>

        {/* Footer actions */}
        <div className="p-8 border-t border-gray-50 bg-[#fafafa]/50">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-4 w-full p-4 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-700 font-black transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-red-100 group-hover:border-red-200 transition-all">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase tracking-widest">Fermer Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="p-4 sm:p-6 md:p-10 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

