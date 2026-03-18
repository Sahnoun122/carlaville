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
    { name: 'Profile', href: '/operations/profile' },
  ],
  [Role.DELIVERY_AGENT]: [
    { name: 'Dashboard', href: '/operations' },
    { name: 'Deliveries', href: '/operations/deliveries' },
    { name: 'Profile', href: '/operations/profile' },
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
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white px-4 py-6">
      <div className="rounded-2xl border border-red-100 bg-linear-to-br from-red-50 to-white px-4 py-4 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-primary">CarlaVille</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-600">Admin Console</p>
      </div>
      <div className="flex flex-col justify-between mt-6">
        <aside>
          <ul className="space-y-1.5">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    pathname === link.href
                      ? 'bg-primary text-white shadow-md shadow-red-200/70'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
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
