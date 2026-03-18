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
    { name: 'Profil', href: '/admin/profile' },
  ],
  [Role.RESERVATION_MANAGER]: [
    { name: 'Tableau de bord', href: '/operations' },
    { name: 'Réservations', href: '/operations/reservations' },
    { name: 'Maintenance', href: '/operations/maintenance' },
    { name: 'Profil', href: '/operations/profile' },
  ],
  [Role.DELIVERY_AGENT]: [
    { name: 'Tableau de bord', href: '/operations' },
    { name: 'Livraisons', href: '/operations/deliveries' },
    { name: 'Profil', href: '/operations/profile' },
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
    Profil: UserRound,
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-100">
      <div className="px-6 pt-8 pb-6">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-red-100 bg-red-50 text-2xl font-black text-primary shadow-sm">
          {initials}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {displayName}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{displayEmail}</p>
      </div>

      <div className="border-t border-gray-200" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <aside>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.name}>
                {(() => {
                  const Icon = iconByName[link.name] || LayoutDashboard;

                  return (
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-bold transition-all ${
                    pathname === link.href
                      ? 'bg-red-50 text-primary'
                      : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
                  );
                })()}
              </li>
            ))}

            <li className="pt-1">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </li>
          </ul>
        </aside>
      </div>

    </div>
  );
};
