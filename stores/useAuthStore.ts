import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { Role } from '../app/generated/prisma/enums';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
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
  isGettingSession: boolean;
  hasCheckedSession: boolean;
  error: string | null;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  signin: (data: SigninData) => Promise<{ success: boolean; message: string; role?: string }>;
  getSession: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isLoading: false,
  isGettingSession: false,
  hasCheckedSession: false,
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

  signin: async (data: SigninData): Promise<{ success: boolean; message: string; role?: string }> => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/signin', data);

      // Get user data from response
      if (response.data.user) {
        set({
          authUser: {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role,
          },
          isLoading: false,
        });

        return { success: true, message: response.data.message, role: response.data.user.role };
      }

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

  getSession: async (): Promise<void> => {
    set({ isGettingSession: true });
    try {
      const response = await axiosInstance.get('/auth/session');
      console.log("response: ", response)

      if (response.data.user) {
        set({
          authUser: {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role,
          },
          isGettingSession: false,
          hasCheckedSession: true,
        });
      }
    } catch (err) {
      // Silently fail - user is not logged in
      console.log("Error while getting session: ", err)
      set({ isGettingSession: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null, error: null });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      set({ authUser: null, error: null });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
