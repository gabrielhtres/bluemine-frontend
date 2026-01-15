import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialAuthState = {
  accessToken: null,
  refreshToken: null,
  permissions: [],
  role: null,
  user: null,
  hasHydrated: false,
  isLoggingOut: false,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialAuthState,

      setAuth: ({ accessToken, refreshToken, permissions, role, user }) => {
        set({ accessToken, refreshToken, permissions, role, user, isLoggingOut: false });
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      logout: () => {
        // Marca que está fazendo logout para evitar novas requisições
        set({ ...initialAuthState, hasHydrated: true, isLoggingOut: true });
        // Limpa após um pequeno delay para garantir que todas as requisições pendentes sejam canceladas
        setTimeout(() => {
          set({ ...initialAuthState, hasHydrated: true, isLoggingOut: false });
        }, 100);
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.accessToken && !state.isLoggingOut;
      },
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