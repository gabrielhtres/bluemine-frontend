import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define o estado que será persistido no localStorage
const initialAuthState = {
  accessToken: null,
  refreshToken: null,
  permissions: [],
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialAuthState,

      setAuth: ({ accessToken, refreshToken, permissions }) =>
        set({ accessToken, refreshToken, permissions }),

      logout: () => set(initialAuthState),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
    },
  ),
);