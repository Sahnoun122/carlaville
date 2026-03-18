'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Role } from '@/types';

const navLinks = {
  [Role.ADMIN]: [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Blogs', href: '/admin/blogs' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Agencies', href: '/admin/agencies' },
    { name: 'Cars', href: '/admin/cars' },
    { name: 'Maintenance', href: '/admin/maintenance' },
    { name: 'Reservations', href: '/admin/reservations' },
    { name: 'Reservation Settings', href: '/admin/reservations/settings' },
    { name: 'Deliveries', href: '/admin/deliveries' },
    { name: 'Pricing', href: '/admin/pricing' },
    { name: 'Profile', href: '/admin/profile' },
  ],
  [Role.RESERVATION_MANAGER]: [
    { name: 'Dashboard', href: '/operations' },
    { name: 'Reservations', href: '/operations/reservations' },
    { name: 'Maintenance', href: '/operations/maintenance' },
  ],
  [Role.DELIVERY_AGENT]: [
    { name: 'Dashboard', href: '/operations' },
    { name: 'Deliveries', href: '/operations/deliveries' },
  ],
};

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = user?.role
    ? navLinks[user.role as keyof typeof navLinks] ?? []
    : pathname.startsWith('/admin')
      ? navLinks[Role.ADMIN]
      : navLinks[Role.RESERVATION_MANAGER];

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-6 bg-white border-r border-slate-200">
      <div className="px-3 py-4 border border-red-100 bg-red-50 rounded-xl">
        <h2 className="text-2xl font-bold text-red-700 tracking-tight">CarlaVille</h2>
        <p className="mt-1 text-xs text-slate-600 uppercase tracking-wide">Admin Console</p>
      </div>
      <div className="flex flex-col justify-between mt-6">
        <aside>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};
