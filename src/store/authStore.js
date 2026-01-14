import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialAuthState = {
  accessToken: null,
  refreshToken: null,
  permissions: [],
  role: null,
  user: null,
  hasHydrated: false,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialAuthState,

      setAuth: ({ accessToken, refreshToken, permissions, role, user }) => {
        set({ accessToken, refreshToken, permissions, role, user });
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      logout: () => set({ ...initialAuthState, hasHydrated: true }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        role: state.role,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);