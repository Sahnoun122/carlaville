'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/role.enum';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (requiredRole && user?.role !== requiredRole) {
      router.push('/'); // Or a dedicated "unauthorized" page
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return <div>Loading...</div>; // Or a spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
