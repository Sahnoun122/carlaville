'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CarFront, LayoutDashboard, LogOut, Settings, Truck, UserRound, Users, Wrench } from 'lucide-react';
import type { ComponentType } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Role } from '@/types';

const navLinks = {
  [Role.ADMIN]: [
    { name: 'Tableau de bord', href: '/admin' },
    { name: 'Blogs', href: '/admin/blogs' },
    { name: 'Utilisateurs', href: '/admin/users' },
    { name: 'Véhicules', href: '/admin/cars' },
    { name: 'Maintenance', href: '/admin/maintenance' },
    { name: 'Réservations', href: '/admin/reservations' },
    { name: 'Paramètres de réservation', href: '/admin/reservations/settings' },
    { name: 'Livraisons', href: '/admin/deliveries' },
    { name: 'Tarification', href: '/admin/pricing' },
  ],
  [Role.RESERVATION_MANAGER]: [
    { name: 'Tableau de bord', href: '/operations' },
    { name: 'Réservations', href: '/operations/reservations' },
    { name: 'Maintenance', href: '/operations/maintenance' },
  ],
  [Role.DELIVERY_AGENT]: [
    { name: 'Tableau de bord', href: '/operations' },
    { name: 'Livraisons', href: '/operations/deliveries' },
  ],
};

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = user?.role
    ? navLinks[user.role as keyof typeof navLinks] ?? []
    : pathname.startsWith('/admin')
      ? navLinks[Role.ADMIN]
      : navLinks[Role.RESERVATION_MANAGER];

  const initials = (user?.name || user?.email || 'A').charAt(0).toUpperCase();
  const displayName = user?.name || 'Admin User';
  const displayEmail = user?.email || 'admin@carlaville.ma';
  const profileLink = pathname.startsWith('/admin')
    ? '/admin/profile'
    : '/operations/profile';

  const iconByName: Record<string, ComponentType<{ className?: string }>> = {
    'Tableau de bord': LayoutDashboard,
    Blogs: LayoutDashboard,
    Utilisateurs: Users,
    Véhicules: CarFront,
    Maintenance: Wrench,
    'Réservations': CalendarDays,
    'Paramètres de réservation': Settings,
    Livraisons: Truck,
    Tarification: Settings,
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      {/* Brand area */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <span className="text-xl font-black tracking-tight text-primary">Carlaville<span className="text-gray-900">.</span></span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Menu Principal</p>
        <nav>
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = iconByName[link.name] || LayoutDashboard;
              const isActive = pathname === link.href || (link.href !== '/admin' && link.href !== '/operations' && pathname.startsWith(link.href));

              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon 
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`} 
                    />
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* User profile & actions */}
      <div className="border-t border-gray-100 p-4">
        <Link href={profileLink} className="mb-2 flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-gray-50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 border border-red-200 text-sm font-bold text-red-700 shadow-sm">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-gray-900">{displayName}</span>
            <span className="truncate text-xs font-medium text-gray-500">{user?.role?.replace('_', ' ') || 'Admin'}</span>
          </div>
        </Link>
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};
