import { create } from 'zustand';
import { User } from '@/types';
import { api, ApiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.login(username, password);
      
      // Store the token in a secure HTTP-only cookie (handled by the backend)
      await api.getCurrentUser().then(({ data }) => {
        set({ user: data, isAuthenticated: true, error: null });
      });
    } catch (error) {
      set({ error: ApiClient.handleError(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.register(username, email, password);
      
      // Store the token in a secure HTTP-only cookie (handled by the backend)
      await api.getCurrentUser().then(({ data }) => {
        set({ user: data, isAuthenticated: true, error: null });
      });
    } catch (error) {
      set({ error: ApiClient.handleError(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await api.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ error: ApiClient.handleError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.getCurrentUser();
      set({ user: data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;