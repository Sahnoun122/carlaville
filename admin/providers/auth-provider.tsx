'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authService } from '@/features/auth/services/auth-service';
import { login as loginApi, logout as logoutApi } from '@/lib/auth';
import { setApiAuthToken } from '@/lib/api';
import { Role, User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      setUser(null);
      return;
    }

    setApiAuthToken(token);

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      logoutApi();
      setApiAuthToken();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const hydrateUser = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setLoading(false);
        return;
      }

      setApiAuthToken(token);

      try {
        await refreshUser();
      } catch {
        logoutApi();
        setApiAuthToken();
        setUser(null);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    void hydrateUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { accessToken, user } = await authService.login({ email, password });
    loginApi(accessToken);
    setApiAuthToken(accessToken);
    setUser(user);

    if (user.role === Role.ADMIN) {
      router.push('/admin');
      return;
    }

    if (user.role === Role.DELIVERY_AGENT) {
      router.push('/operations/deliveries');
      return;
    }

    router.push('/operations');
  };

  const logout = () => {
    logoutApi();
    setApiAuthToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
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
