"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-white border-r border-gray-200 shrink-0">
        <div className="p-8 border-b border-gray-100 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-20 h-20 bg-red-50 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <span className="text-2xl font-extrabold">{user?.name ? user.name.charAt(0).toUpperCase() : 'C'}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <nav className="p-6 space-y-3">
          <Link href="/dashboard" className="flex items-center gap-4 w-full p-4 rounded-xl bg-red-50 text-primary font-bold transition-colors">
            <Calendar className="w-5 h-5" /> Mes Réservations
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition-colors text-left border border-transparent">
            <LogOut className="w-5 h-5 text-gray-400" /> Déconnexion
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}
