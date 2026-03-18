'use client';
import { useAuth } from '@/providers/auth-provider';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-white/85">
      <div className="flex items-center gap-3">
        <span className="h-10 w-1.5 rounded-full bg-primary" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Back Office</p>
          <h2 className="text-lg font-bold text-gray-900">Bienvenue, {user?.name}</h2>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={logout}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
};
