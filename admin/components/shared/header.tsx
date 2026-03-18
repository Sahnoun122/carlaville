'use client';
import { useAuth } from '@/providers/auth-provider';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-slate-800">
          Welcome, {user?.name}
        </h2>
      </div>
      <div className="flex items-center">
        <button
          onClick={logout}
          className="text-sm font-medium text-slate-600 hover:text-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
