import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
  token: null,
  permissions: [],
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
     ...initialState,

      setAuth: ({ token, permissions }) =>
        set({ token, permissions }),

      clearAuth: () => set({ token: null, permissions: [] }),

      isAuthenticated: () => !!get().token,
      
      logout: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);
