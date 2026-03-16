import { create } from 'zustand';
import { User } from '@/types/user';
import { Role } from '@/types/role.enum';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isReservationManager: boolean;
  isDeliveryAgent: boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isReservationManager: false,
  isDeliveryAgent: false,
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === Role.ADMIN,
      isReservationManager: user?.role === Role.RESERVATION_MANAGER,
      isDeliveryAgent: user?.role === Role.DELIVERY_AGENT,
    });
  },
}));
