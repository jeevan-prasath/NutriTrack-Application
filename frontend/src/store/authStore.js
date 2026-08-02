import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('nt_token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          localStorage.setItem('nt_token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      logout: () => {
        localStorage.removeItem('nt_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      updateProfile: async (profileData) => {
        set({ loading: true });
        try {
          const { data } = await api.put('/auth/profile', profileData);
          set({ user: data.user, loading: false });
          return { success: true };
        } catch (err) {
          set({ loading: false });
          return { success: false, message: err.response?.data?.message };
        }
      },
    }),
    {
      name: 'nt_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
