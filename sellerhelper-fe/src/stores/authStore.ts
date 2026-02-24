import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResponse } from '@/services/auth.service';

interface AuthState {
  user: LoginResponse | null;
  setUser: (user: LoginResponse) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      isLoggedIn: () => !!get().user,
    }),
    {
      name: 'sellerhelper_auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : (noopStorage as Storage)
      ),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
