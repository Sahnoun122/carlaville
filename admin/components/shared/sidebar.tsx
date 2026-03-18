'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Role } from '@/types';

const navLinks = {
  [Role.ADMIN]: [
    { name: 'Dashboard', href: '/admin' },
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
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r">
      <h2 className="text-3xl font-semibold text-center text-indigo-600">
        CarlaVille
      </h2>
      <div className="flex flex-col justify-between mt-6">
        <aside>
          <ul>
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200 ${
                    pathname === link.href ? 'bg-gray-200' : ''
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
