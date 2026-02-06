import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified?: boolean;
  provider?: string;
  profilePicture?: string;
  phoneNumber?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = '@auth_tokens';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      console.log('🔄 AuthStore: Loading tokens from storage...');
      // Load tokens from storage
      const storedTokens = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      console.log('🔄 AuthStore: Tokens loaded from storage:', !!storedTokens);
      if (storedTokens) {
        const { accessToken, refreshToken } = JSON.parse(storedTokens);
        console.log('✅ AuthStore: Tokens found in storage');
        set({ accessToken, refreshToken, isAuthenticated: !!accessToken, isLoading: true });
        // Keep loading true if we have tokens - AuthProvider will fetch profile and set it to false
      } else {
        console.log('ℹ️ AuthStore: No tokens in storage');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('❌ AuthStore: Error loading tokens from storage:', error);
      set({ isLoading: false });
    }
  },

  setTokens: async (access, refresh) => {
    try {
      // Save tokens to storage
      await AsyncStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({ accessToken: access, refreshToken: refresh })
      );
      set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
      // Still set tokens in memory even if storage fails
      set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
    }
  },

  setUser: (user) =>
    set({ user, isAuthenticated: true }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  logout: async () => {
    try {
      // Remove tokens from storage
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing tokens from storage:', error);
    }
    set({ 
      accessToken: null, 
      refreshToken: null, 
      user: null, 
      isAuthenticated: false 
    });
  },
}));
