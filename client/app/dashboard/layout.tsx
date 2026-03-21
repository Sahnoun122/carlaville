"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, LogOut, Car, History, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 w-full p-3.5 rounded-xl font-bold transition-all shadow-sm border ${
          isActive 
            ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 shadow-sm' 
            : 'text-gray-400 border-transparent hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : ''}`} /> 
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 shrink-0 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        {/* Brand/User Area */}
        <div className="p-8 border-b border-gray-50 bg-[#fff] flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="mb-8 block">
            <span className="text-2xl font-black tracking-tighter text-red-600">Carlaville<span className="text-gray-900">.</span></span>
          </Link>
          
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-red-100 group-hover:bg-red-100 transition-colors">
              <span className="text-3xl font-black">{user?.name ? user.name.charAt(0).toUpperCase() : 'C'}</span>
            </div>
          </div>
          
          <h2 className="text-xl font-black text-gray-900 leading-tight">{user?.name}</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Espace Client</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          <NavLink href="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
          <NavLink href="/dashboard/reservations" icon={Calendar} label="Mes Réservations" />
          <NavLink href="/dashboard/history" icon={History} label="Historique" />
          <NavLink href="/cars" icon={Car} label="Catalogue Flotte" />
        </nav>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-50 bg-gray-50/30">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full p-3.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-700 font-bold transition-all"
          >
            <LogOut className="w-5 h-5" /> 
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-12 lg:p-16">
          {children}
        </div>
      </main>
    </div>
  );
}
