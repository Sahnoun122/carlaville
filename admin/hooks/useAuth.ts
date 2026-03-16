import { useAuthStore } from '../stores/auth.store';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isReservationManager = useAuthStore(
    (state) => state.isReservationManager,
  );
  const isDeliveryAgent = useAuthStore((state) => state.isDeliveryAgent);
  const setUser = useAuthStore((state) => state.setUser);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isReservationManager,
    isDeliveryAgent,
    setUser,
  };
};
