'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: { accessToken: string; user: User }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('carlaville_token');
    localStorage.removeItem('carlaville_user');
    setUser(null);
    router.push('/');
  }, [router]);

  useEffect(() => {
    const hydrate = () => {
      try {
        const token = localStorage.getItem('carlaville_token');
        const userData = localStorage.getItem('carlaville_user');

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Auth hydration error:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [logout]);

  const login = (data: { accessToken: string; user: User }) => {
    localStorage.setItem('carlaville_token', data.accessToken);
    localStorage.setItem('carlaville_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
