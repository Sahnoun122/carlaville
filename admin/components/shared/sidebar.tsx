'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CarFront, LayoutDashboard, LogOut, Settings, Truck, Users, Wrench, DollarSign, X } from 'lucide-react';
import type { ComponentType } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

const navLinks = {
  [Role.ADMIN]: [
    { name: 'Tableau de bord', href: '/admin' },
    { name: 'Blogs', href: '/admin/blogs' },
    { name: 'Utilisateurs', href: '/admin/users' },
    { name: 'Agences', href: '/admin/agencies' },
    { name: 'Revenus', href: '/admin/revenues' },
    { name: 'Véhicules', href: '/admin/cars' },
    { name: 'Maintenance', href: '/admin/maintenance' },
    { name: 'Réservations', href: '/admin/reservations' },
    { name: 'Paramètres de réservation', href: '/admin/reservations/settings' },
    { name: 'Livraisons', href: '/admin/deliveries' },
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
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
    Agences: Users,
    Véhicules: CarFront,
    Maintenance: Wrench,
    'Réservations': CalendarDays,
    'Paramètres de réservation': Settings,
    Livraisons: Truck,
    'Revenus': DollarSign,
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onClose}
          aria-label="Fermer la navigation"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-72 lg:translate-x-0 lg:shadow-[1px_0_10px_rgba(15,23,42,0.04)]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
        <span className="text-xl font-black tracking-tight text-primary">
          Carlaville<span className="text-slate-900">.</span>
        </span>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 lg:hidden"
          onClick={onClose}
          aria-label="Fermer la navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Menu Principal</p>
        <nav>
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = iconByName[link.name] || LayoutDashboard;
              const isActive = pathname === link.href || (
                link.href !== '/admin' &&
                link.href !== '/operations' &&
                pathname.startsWith(link.href + '/') &&
                !links.some((l) => l.href !== link.href && pathname.startsWith(l.href) && l.href.length > link.href.length)
              );

              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'
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

      <div className="border-t border-slate-100 p-4">
        <Link href={profileLink} className="mb-3 flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-slate-50">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-sm font-bold text-red-700 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <span className="truncate text-sm font-bold text-slate-900">{displayName}</span>
            <span className="truncate text-xs font-medium text-slate-500">{displayEmail}</span>
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {user?.role?.replace('_', ' ') || 'Admin'}
            </span>
          </div>
        </Link>
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-600" />
          Déconnexion
        </button>
      </div>
      </aside>
    </>
  );
};
