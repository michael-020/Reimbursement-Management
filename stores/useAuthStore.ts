import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  country: string;
  currency: string;
}

interface SigninData {
  email: string;
  password: string;
}

interface AuthStore {
  authUser: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  signin: (data: SigninData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isLoading: false,
  error: null,

  signup: async (data: SignupData): Promise<{ success: boolean; message: string }> => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/signup', data);

      // Store user info from the response
      if (response.data.adminDb) {
        set({
          authUser: {
            id: response.data.adminDb.id,
            email: response.data.adminDb.email,
            name: response.data.adminDb.name,
            role: response.data.adminDb.role,
          },
          isLoading: false,
        });
      }

      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      let message = 'Signup failed';
      if (err instanceof AxiosError && err.response?.data?.msg) {
        message = err.response.data.msg as string;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  signin: async (data: SigninData): Promise<{ success: boolean; message: string }> => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/signin', data);

      // Get user data by fetching profile or from your API
      // For now, store basic info from the request
      set({
        authUser: {
          id: data.email, // Placeholder, you might want to fetch actual user data
          email: data.email,
          name: '',
          role: '',
        },
        isLoading: false,
      });

      return { success: true, message: response.data.message };
    } catch (err) {
      let message = 'Signin failed';
      if (err instanceof AxiosError && err.response?.data?.msg) {
        message = err.response.data.msg as string;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    set({ authUser: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
