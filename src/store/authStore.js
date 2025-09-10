import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialAuthState = {
  accessToken: null,
  refreshToken: null,
  permissions: [],
  user: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialAuthState,

      setAuth: ({ accessToken, refreshToken, permissions, user }) =>
        set({ accessToken, refreshToken, permissions, user }),

      logout: () => set(initialAuthState),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
    },
  ),
);