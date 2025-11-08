import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authService, apiClient } from '@/services';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, roleId?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  refreshUser: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const { user, token } = await authService.login({ email, password });
        // Sync token with API client
        apiClient.setToken(token);
        set({ user, token, isAuthenticated: true });
      },

      register: async (email: string, password: string, roleId?: string) => {
        const { user, token } = await authService.register({ email, password, roleId });
        // Sync token with API client
        apiClient.setToken(token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        // Clear auth service (this also clears API client token)
        authService.logout();
        // Clear store state
        set({ user: null, token: null, isAuthenticated: false });
        // Clear any additional localStorage items
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        // Sync token with API client
        apiClient.setToken(token);
        set({ token, isAuthenticated: true });
      },

      refreshUser: async () => {
        try {
          const user = await authService.me();
          set({ user });
        } catch (error) {
          // If refresh fails, logout
          get().logout();
        }
      },

      initialize: () => {
        // On mount, sync token from store to API client
        const { token } = get();
        if (token) {
          apiClient.setToken(token);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, sync token with API client
        if (state?.token) {
          apiClient.setToken(state.token);
        }
      },
    }
  )
);

