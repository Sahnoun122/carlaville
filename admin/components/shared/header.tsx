'use client';
import { useAuth } from '@/providers/auth-provider';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-8 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
      <div className="flex items-center">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">Bienvenue, {user?.name || 'Admin'}</h2>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={logout}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
};
