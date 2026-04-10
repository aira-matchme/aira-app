import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutApi } from '../modules/auth/api';
import { syncSentryUser } from '../services/sentry/userContext';
import { useProfileStore } from './profile.store';
import { usePreferencesStore } from './preferences.store';
import { useOnboardingStore } from './onboarding.store';
import { useUserStore } from './user.store';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified?: boolean;
  provider?: string;
  profilePicture?: string;
  phoneNumber?: string;
  isProfileComplete?: boolean;
  profilePhoto?: { key?: unknown; url?: unknown; id?: string };
  livenessCheck?: boolean;
  galleryPhotosUploaded?: boolean;
  questionnaireCompleted?: boolean;
}

const TOKEN_STORAGE_KEY = '@auth_tokens';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  shouldShowEnableNotifications: boolean;
  /** Set true when user completes preferences flow (Get Started); RootNavigator uses this to show Tabs */
  preferenceFlowCompleted: boolean;
  initialize: () => Promise<void>;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setShouldShowEnableNotifications: (show: boolean) => void;
  setPreferenceFlowCompleted: (value: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  shouldShowEnableNotifications: false,
  preferenceFlowCompleted: false,

  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        const { accessToken, refreshToken } = JSON.parse(stored);
        set({ accessToken, refreshToken, isAuthenticated: !!accessToken, isLoading: true });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  setTokens: async (access, refresh) => {
    try {
      await AsyncStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({ accessToken: access, refreshToken: refresh }),
      );
    } catch (e) {
      // Save failed
    }
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  setUser: (user) => {
    const normalized = { ...user };
    if (typeof (user as any)?.profileCompleted === 'boolean') {
      normalized.isProfileComplete = (user as any).profileCompleted;
    }
    syncSentryUser(normalized);
    set({ user: normalized, isAuthenticated: true });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setShouldShowEnableNotifications: (show) =>
    set({ shouldShowEnableNotifications: show }),

  setPreferenceFlowCompleted: (value) => set({ preferenceFlowCompleted: value }),

  logout: async () => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      try {
        await logoutApi();
      } catch {
        // Still sign out locally if the network fails or the session is already invalid.
      }
    }
    try {
      await AsyncStorage.clear();
    } catch (e) {
      // Clear failed
    }
    useProfileStore.getState().resetProfile();
    usePreferencesStore.getState().reset();
    useOnboardingStore.getState().clearOnboarding();
    useUserStore.getState().clearUser();
    syncSentryUser(null);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      shouldShowEnableNotifications: false,
      preferenceFlowCompleted: false,
    });
  },
}));
