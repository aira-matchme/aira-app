/**
 * Unit test cases for Aira codebase.
 * Run: npm test
 *
 * Covers: auth store, profile store, getPostAuthScreen, API endpoints,
 * preferences payload builder, chat mappers, network utils.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from '../src/services/api/endpoints';
import { useAuthStore } from '../src/store/auth.store';
import { useProfileStore } from '../src/store/profile.store';
import { getPostAuthScreen } from '../src/navigation/getPostAuthScreen';
import {
  buildAddPreferencePayload,
  patchEditPreference,
  addPreference,
} from '../src/modules/preferences/api';
import {
  mapChatResponseToItem,
  mapApiMessageToChatMessage,
  type ChatListItemResponse,
  type ChatMessageApiItem,
} from '../src/modules/chat/api';
import { getAdjustedApiUrl } from '../src/utils/network';
import type { PreferencesState } from '../src/store/preferences.store';

// --- Mock AsyncStorage for auth store ---
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

describe('API Endpoints', () => {
  it('exposes auth endpoints', () => {
    expect(endpoints.auth).toBeDefined();
    expect(endpoints.auth.login).toBe('/auth/login');
    expect(endpoints.auth.sendOtp).toBe('/auth/send-otp');
    expect(endpoints.auth.verifyOtp).toBe('/auth/verify-otp');
    expect(endpoints.auth.refresh).toBe('/auth/refresh');
    expect(endpoints.auth.logout).toBe('/auth/logout');
  });

  it('exposes user endpoints', () => {
    expect(endpoints.user).toBeDefined();
    expect(endpoints.user.profile).toBe('/auth/profile');
    expect(endpoints.user.selfie).toBe('/auth/selfie');
    expect(endpoints.user.uploadPhotos).toBe('/auth/gallery');
    expect(endpoints.user.deletePhoto).toContain('{id}');
  });

  it('exposes preferences endpoints', () => {
    expect(endpoints.preferences).toBeDefined();
    expect(endpoints.preferences.editPreference).toBe('/auth/preference');
    expect(endpoints.preferences.addPreference).toBe('/auth/preference/add');
  });

  it('exposes chat endpoints', () => {
    expect(endpoints.chat).toBeDefined();
    expect(endpoints.chat.getChats).toBe('/chat/get-chat-list');
    expect(endpoints.chat.sendMessage).toBe('/chat/send-message');
    expect(endpoints.chat.markSeen).toBe('/chat/mark-seen');
  });
});

describe('Auth Store', () => {
  beforeEach(async () => {
    useAuthStore.getState().logout();
    jest.clearAllMocks();
  });

  it('initial state is unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('initialize with no stored tokens sets isLoading false', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('initialize with stored tokens restores auth state', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ accessToken: 'at', refreshToken: 'rt' })
    );
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('at');
    expect(state.refreshToken).toBe('rt');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setTokens persists and updates state', async () => {
    await useAuthStore.getState().setTokens('access1', 'refresh1');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@auth_tokens',
      JSON.stringify({ accessToken: 'access1', refreshToken: 'refresh1' })
    );
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access1');
    expect(state.refreshToken).toBe('refresh1');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setUser normalizes profileCompleted to isProfileComplete', () => {
    useAuthStore.getState().setUser({
      id: '1',
      email: 'a@b.com',
      name: 'Test',
      profileCompleted: true,
    } as any);
    const state = useAuthStore.getState();
    expect(state.user?.isProfileComplete).toBe(true);
  });

  it('logout clears storage and state', async () => {
    await useAuthStore.getState().setTokens('a', 'r');
    await useAuthStore.getState().logout();
    expect(AsyncStorage.clear).toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.preferenceFlowCompleted).toBe(false);
  });

  it('setPreferenceFlowCompleted updates flag', () => {
    useAuthStore.getState().setPreferenceFlowCompleted(true);
    expect(useAuthStore.getState().preferenceFlowCompleted).toBe(true);
  });
});

describe('Profile Store', () => {
  beforeEach(() => {
    useProfileStore.getState().resetProfile();
  });

  it('initial step is 1 and totalSteps is 13', () => {
    const state = useProfileStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.totalSteps).toBe(13);
  });

  it('setName updates name', () => {
    useProfileStore.getState().setName('Alice');
    expect(useProfileStore.getState().name).toBe('Alice');
  });

  it('isStepComplete(1) is true only when name is non-empty', () => {
    expect(useProfileStore.getState().isStepComplete(1)).toBe(false);
    useProfileStore.getState().setName('');
    expect(useProfileStore.getState().isStepComplete(1)).toBe(false);
    useProfileStore.getState().setName('  ');
    expect(useProfileStore.getState().isStepComplete(1)).toBe(false);
    useProfileStore.getState().setName('Alice');
    expect(useProfileStore.getState().isStepComplete(1)).toBe(true);
  });

  it('setDateOfBirth and isStepComplete(2)', () => {
    expect(useProfileStore.getState().isStepComplete(2)).toBe(false);
    useProfileStore.getState().setDateOfBirth(1, 6, 1990);
    expect(useProfileStore.getState().dateOfBirth).toEqual({
      day: 1,
      month: 6,
      year: 1990,
    });
    expect(useProfileStore.getState().isStepComplete(2)).toBe(true);
  });

  it('setGender and isStepComplete(3)', () => {
    useProfileStore.getState().setGender('female');
    expect(useProfileStore.getState().isStepComplete(3)).toBe(true);
  });

  it('setBodyType and isStepComplete(4)', () => {
    useProfileStore.getState().setBodyType('slim');
    expect(useProfileStore.getState().isStepComplete(4)).toBe(true);
  });

  it('setHeight and isStepComplete(5)', () => {
    expect(useProfileStore.getState().isStepComplete(5)).toBe(false);
    useProfileStore.getState().setHeight(170, 'cm');
    expect(useProfileStore.getState().isStepComplete(5)).toBe(true);
  });

  it('resetProfile restores initial state', () => {
    useProfileStore.getState().setName('Bob');
    useProfileStore.getState().setCurrentStep(5);
    useProfileStore.getState().resetProfile();
    expect(useProfileStore.getState().name).toBeNull();
    expect(useProfileStore.getState().currentStep).toBe(1);
  });
});

describe('getPostAuthScreen', () => {
  it('returns EnableNotifications when shouldShowEnableNotifications is true', () => {
    expect(
      getPostAuthScreen(
        { isProfileComplete: true, livenessCheck: true, galleryPhotosUploaded: true, questionnaireCompleted: true },
        true
      )
    ).toBe('EnableNotifications');
  });

  it('returns ProfileIntro when user is null', () => {
    expect(getPostAuthScreen(null, false)).toBe('ProfileIntro');
  });

  it('returns ProfileIntro when profile not complete', () => {
    expect(
      getPostAuthScreen({ isProfileComplete: false }, false)
    ).toBe('ProfileIntro');
  });

  it('returns FaceVerification when profile complete but no liveness', () => {
    expect(
      getPostAuthScreen(
        { isProfileComplete: true, livenessCheck: false },
        false
      )
    ).toBe('FaceVerification');
  });

  it('returns ProfilePhotos when liveness done but gallery not uploaded', () => {
    expect(
      getPostAuthScreen(
        {
          isProfileComplete: true,
          livenessCheck: true,
          galleryPhotosUploaded: false,
        },
        false
      )
    ).toBe('ProfilePhotos');
  });

  it('returns OnboardingIntro when gallery done but questionnaire not', () => {
    expect(
      getPostAuthScreen(
        {
          isProfileComplete: true,
          livenessCheck: true,
          galleryPhotosUploaded: true,
          questionnaireCompleted: false,
        },
        false
      )
    ).toBe('OnboardingIntro');
  });

  it('returns Likes when all steps complete', () => {
    expect(
      getPostAuthScreen(
        {
          isProfileComplete: true,
          livenessCheck: true,
          galleryPhotosUploaded: true,
          questionnaireCompleted: true,
        },
        false
      )
    ).toBe('Likes');
  });
});

describe('Preferences buildAddPreferencePayload', () => {
  it('builds payload with default fallbacks when state is minimal', () => {
    const state: PreferencesState = {
      lookingForGender: [],
      preferredMinAge: 18,
      preferredMaxAge: 30,
      preferredMinHeightcm: 155,
      preferredMaxHeightcm: 170,
      distanceMilesLow: 10,
      distanceMilesHigh: 20,
      preferredEducation: null,
      preferredEmployment: [],
      preferredIncome: null,
      preferredMaritalStatus: null,
      preferredReligions: [],
      preferredBodyTypes: [],
      openedEditFromSummary: false,
      setLookingForGender: () => {},
      setAgeRange: () => {},
      setHeightRange: () => {},
      setDistanceMiles: () => {},
      setPreferredEducation: () => {},
      setPreferredEmployment: () => {},
      setPreferredIncome: () => {},
      setPreferredMaritalStatus: () => {},
      setPreferredReligions: () => {},
      setPreferredBodyTypes: () => {},
      setOpenedEditFromSummary: () => {},
      reset: () => {},
    };
    const payload = buildAddPreferencePayload(state);
    expect(payload.lookingForGender).toBe('female');
    expect(payload.preferredRadiusKm).toBe(Math.round(20 * 1.60934));
    expect(payload.preferredEducationLevels).toBe('other');
    expect(payload.preferredEmploymentStatuses).toEqual([]);
    expect(payload.preferredIncomeRanges).toBe('prefer_not_to_say');
    expect(payload.preferredMinAge).toBe(18);
    expect(payload.preferredMaxAge).toBe(30);
    expect(payload.preferredMaritalStatus).toEqual([]);
    expect(payload.preferredChildren).toBe('no');
  });

  it('maps man to male for lookingForGender', () => {
    const state = {
      lookingForGender: ['man'],
      preferredMinAge: 18,
      preferredMaxAge: 30,
      preferredMinHeightcm: 160,
      preferredMaxHeightcm: 180,
      distanceMilesLow: 10,
      distanceMilesHigh: 25,
      preferredEducation: 'degree_or_equivalent' as const,
      preferredEmployment: ['employed'],
      preferredIncome: 'eur_30k_40k' as const,
      preferredMaritalStatus: 'never_married' as const,
      preferredReligions: [],
      preferredBodyTypes: [],
      openedEditFromSummary: false,
      setLookingForGender: () => {},
      setAgeRange: () => {},
      setHeightRange: () => {},
      setDistanceMiles: () => {},
      setPreferredEducation: () => {},
      setPreferredEmployment: () => {},
      setPreferredIncome: () => {},
      setPreferredMaritalStatus: () => {},
      setPreferredReligions: () => {},
      setPreferredBodyTypes: () => {},
      setOpenedEditFromSummary: () => {},
      reset: () => {},
    } as PreferencesState;
    const payload = buildAddPreferencePayload(state);
    expect(payload.lookingForGender).toBe('male');
    expect(payload.preferredEducationLevels).toBe('degree_or_equivalent');
    expect(payload.preferredEmploymentStatuses).toEqual(['employed']);
    expect(payload.preferredIncomeRanges).toBe('eur_30k_40k');
    expect(payload.preferredMaritalStatus).toEqual(['never_married']);
  });
});

describe('Chat mapChatResponseToItem', () => {
  it('maps API chat item to UI item with name and preview', () => {
    const item: ChatListItemResponse = {
      _id: 'chat1',
      participantDetails: {
        _id: 'user1',
        name: 'Jane',
        nickName: 'J',
        profilePhoto: 'https://example.com/photo.jpg',
      },
      lastMessage: { content: { text: 'Hello', type: 'text' } },
      lastActivityAt: '2025-03-05T12:00:00Z',
      myUnreadCount: 2,
      isPinnedForMe: true,
    };
    const result = mapChatResponseToItem(item, 0);
    expect(result.id).toBe('chat1');
    expect(result.name).toBe('J'); // nickName overrides name
    expect(result.avatar).toEqual({ uri: 'https://example.com/photo.jpg' });
    expect(result.preview).toBe('Hello');
    expect(result.unreadCount).toBe(2);
    expect(result.pinned).toBe(true);
    expect(result.otherUserId).toBe('user1');
  });

  it('falls back to name when nickName missing and shows Unknown when both missing', () => {
    const withName: ChatListItemResponse = {
      _id: 'c1',
      participantDetails: { _id: 'u1', name: 'Bob' },
    };
    expect(mapChatResponseToItem(withName, 0).name).toBe('Bob');

    const noName: ChatListItemResponse = {
      _id: 'c2',
      participantDetails: { _id: 'u2' },
    };
    expect(mapChatResponseToItem(noName, 0).name).toBe('Unknown');
  });

  it('returns null avatar when no profilePhoto', () => {
    const item: ChatListItemResponse = {
      _id: 'c1',
      participantDetails: { _id: 'u1', name: 'X' },
    };
    expect(mapChatResponseToItem(item, 0).avatar).toBeNull();
  });
});

describe('Chat mapApiMessageToChatMessage', () => {
  it('maps text message with content string', () => {
    const api: ChatMessageApiItem = {
      _id: 'msg1',
      messageType: 'text',
      content: 'Hi there',
      messageTimeStamp: '2025-03-05T14:30:00Z',
      isSentByMe: true,
    };
    const ui = mapApiMessageToChatMessage(api);
    expect(ui).not.toBeNull();
    expect(ui?.type).toBe('text');
    expect((ui as any).text).toBe('Hi there');
    expect((ui as any).sent).toBe(true);
  });

  it('maps text from content object', () => {
    const api: ChatMessageApiItem = {
      _id: 'm1',
      content: { text: 'From object', type: 'text' },
      createdAt: '2025-03-05T10:00:00Z',
    };
    const ui = mapApiMessageToChatMessage(api);
    expect(ui?.type).toBe('text');
    expect((ui as any).text).toBe('From object');
  });

  it('maps image message with uri', () => {
    const api: ChatMessageApiItem = {
      _id: 'm2',
      messageType: 'image',
      files: [{ url: 'https://example.com/img.jpg' }],
      messageTimeStamp: '2025-03-05T10:00:00Z',
    };
    const ui = mapApiMessageToChatMessage(api);
    expect(ui?.type).toBe('image');
    expect((ui as any).uri).toBe('https://example.com/img.jpg');
  });

  it('returns null for image when no uri', () => {
    const api: ChatMessageApiItem = {
      _id: 'm3',
      messageType: 'image',
      files: [],
      messageTimeStamp: '2025-03-05T10:00:00Z',
    };
    expect(mapApiMessageToChatMessage(api)).toBeNull();
  });

  it('maps voice message', () => {
    const api: ChatMessageApiItem = {
      _id: 'm4',
      messageType: 'voice',
      messageTimeStamp: '2025-03-05T10:00:00Z',
    };
    const ui = mapApiMessageToChatMessage(api);
    expect(ui?.type).toBe('voice');
  });
});

describe('Network getAdjustedApiUrl', () => {
  it('returns baseUrl as-is when non-empty', () => {
    expect(getAdjustedApiUrl('http://localhost:3001')).toBe('http://localhost:3001');
    expect(getAdjustedApiUrl('https://api.example.com')).toBe('https://api.example.com');
  });

  it('returns empty string when baseUrl is empty', () => {
    expect(getAdjustedApiUrl('')).toBe('');
  });
});

// API tests (mocked apiClient, request/response contracts, interceptors) live in __tests__/api.test.ts
