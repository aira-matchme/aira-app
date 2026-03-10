/**
 * API tests – QA reference & developer implementation
 *
 * Run: npm test -- --testPathPattern="api.test" --watchAll=false
 *
 * QA REFERENCE: Scenarios below match API contract testing. For each endpoint
 * we assert: HTTP method, URL, request payload shape, and response shape.
 *
 * | Area        | Scenario                    | Request / Response check                    |
 * |-------------|-----------------------------|---------------------------------------------|
 * | Auth        | POST /auth/login            | Body: { email, password }; 200 + tokens     |
 * | Auth        | POST /auth/login            | 401 → error                                 |
 * | Auth        | POST /auth/send-otp         | Body: { email }; 200 + message/expiresIn     |
 * | Auth        | POST /auth/verify-otp      | Body: { email, otp, deviceToken, deviceId } |
 * | Auth        | POST /auth/verify-otp       | Invalid OTP → error                          |
 * | Auth        | POST /auth/social-login    | Body: provider, providerId, email, name…    |
 * | Chat        | POST /chat/get-chat-list   | Params: page, limit; 200 + list + meta      |
 * | Chat        | POST /chat/get-pending…    | Params: page, limit                          |
 * | Chat        | POST /chat/chat-request-action | Body: chatId, action (accept/reject)      |
 * | Chat        | POST /chat/send-message    | Body: chatId, content, messageType, files   |
 * | Chat        | POST /aws-s3-files/upload   | FormData file; 200 + url, key               |
 * | Interceptors| Request                     | Adds Authorization + x-api-key when set    |
 * | Interceptors| Response 401                 | Refreshes token and retries request         |
 * | Interceptors| Response 401 refresh fail   | Logs out user                                |
 * | Interceptors| Timeout                     | Shows timeout modal and retry callback       |
 */

import { endpoints } from '../src/services/api/endpoints';

// --- Mock client: callable (apiClient(config)) and has post/get/request/interceptors ---
jest.mock('../src/services/api/client', () => {
  const post = jest.fn();
  const get = jest.fn();
  const request = jest.fn();
  const requestUse = jest.fn();
  const responseUse = jest.fn();
  const apiClient = Object.assign(
    (config: unknown) => request(config),
    {
      post,
      get,
      request,
      interceptors: { request: { use: requestUse }, response: { use: responseUse } },
    }
  );
  return { apiClient };
});

// Auth store mock for interceptor tests (getState overridden in tests)
const mockSetTokens = jest.fn();
const mockLogout = jest.fn();
jest.mock('../src/store/auth.store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      accessToken: null as string | null,
      refreshToken: null as string | null,
      setTokens: mockSetTokens,
      logout: mockLogout,
    })),
  },
}));
const authStore = require('../src/store/auth.store').useAuthStore;

jest.mock('../src/store/apiError.store', () => ({
  useApiErrorStore: {
    getState: jest.fn(() => ({ showError: jest.fn() })),
  },
}));

const mockShowTimeout = jest.fn();
jest.mock('../src/store/apiTimeout.store', () => ({
  useApiTimeoutStore: {
    getState: jest.fn(() => ({ showTimeout: mockShowTimeout })),
  },
}));

jest.mock('../src/config/env', () => ({
  env: { API_KEY: 'test-api-key' },
}));

// Import after mocks – use same apiClient ref that auth/chat use
import { apiClient } from '../src/services/api/client';
import {
  loginApi,
  sendOtpApi,
  resendOtpApi,
  verifyOtpApi,
  socialLoginApi,
} from '../src/modules/auth/api';
import {
  getChatListApi,
  getPendingChatsApi,
  setChatRequestActionApi,
  sendMessageApi,
  uploadChatFileApi,
} from '../src/modules/chat/api';
import { setupInterceptors } from '../src/services/api/interceptors';

// --- Shared response shapes (QA reference) ---
const mockAuthResponse = {
  statusCode: 200,
  message: 'Success',
  data: {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      emailVerified: true,
    },
  },
};

const mockSendOtpResponse = {
  statusCode: 200,
  message: 'OTP sent',
  data: { message: 'OTP sent to email', expiresIn: 300 },
};

const mockChatListResponse = {
  statusCode: 200,
  data: {
    list: [],
    meta: { total: 0, limit: 20, pageNo: 1, totalPages: 0, currentPage: 1 },
  },
};

describe('Auth API (QA: request/response contract)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/login – success: sends email+password and returns AuthResponse with tokens and user', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockAuthResponse });

    const payload = { email: 'test@example.com', password: 'secret123' };
    const result = await loginApi(payload);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.login, payload);
    expect(result).toEqual(mockAuthResponse);
    expect(result.data.accessToken).toBe('access-token-123');
    expect(result.data.refreshToken).toBe('refresh-token-456');
    expect(result.data.user.email).toBe('user@example.com');
  });

  it('POST /auth/login – 401: propagates error to caller', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce({ response: { status: 401, data: { message: 'Invalid credentials' } } });

    await expect(
      loginApi({ email: 'bad@example.com', password: 'wrong' })
    ).rejects.toMatchObject({ response: { status: 401 } });
    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.login, {
      email: 'bad@example.com',
      password: 'wrong',
    });
  });

  it('POST /auth/send-otp – success: sends email and returns SendOtpResponse', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockSendOtpResponse });

    const payload = { email: 'user@example.com' };
    const result = await sendOtpApi(payload);

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.sendOtp, payload);
    expect(result.data.message).toBeDefined();
    expect(result.data.expiresIn).toBe(300);
  });

  it('POST /auth/resend-otp – sends same payload as sendOtp', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockSendOtpResponse });

    await resendOtpApi({ email: 'user@example.com' });

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.resendOtp, {
      email: 'user@example.com',
    });
  });

  it('POST /auth/verify-otp – success: sends email, otp, deviceToken, deviceId and returns AuthResponse', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockAuthResponse });

    const payload = {
      email: 'user@example.com',
      otp: '123456',
      deviceToken: 'fcm-token',
      deviceId: 'device-id',
    };
    const result = await verifyOtpApi(payload);

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.verifyOtp, payload);
    expect(result.data.accessToken).toBeDefined();
    expect(result.data.user).toBeDefined();
  });

  it('POST /auth/verify-otp – invalid OTP: propagates error', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce({ response: { status: 400, data: { message: 'Invalid OTP' } } });

    await expect(
      verifyOtpApi({
        email: 'user@example.com',
        otp: '000000',
        deviceToken: 't',
        deviceId: 'd',
      })
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('POST /auth/social-login – success: sends provider, providerId, email, name and returns AuthResponse', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockAuthResponse });

    const payload = {
      provider: 'google' as const,
      providerId: 'google-id-123',
      email: 'user@gmail.com',
      name: 'Google User',
      emailVerified: true,
    };
    const result = await socialLoginApi(payload);

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.socialLogin, payload);
    expect(result.data.user.name).toBe('Test User');
  });
});

describe('Chat API (QA: request/response contract)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /chat/get-chat-list – pagination params passed correctly', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockChatListResponse });

    const result = await getChatListApi({ page: 2, limit: 30 });

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(
      endpoints.chat.getChats,
      expect.objectContaining({ params: { page: 2, limit: 30 } })
    );
    expect(result.data).toBeDefined();
    expect(result.data.meta).toBeDefined();
  });

  it('POST /chat/get-pending-chat-list – returns pending list with page and limit in body', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockChatListResponse });

    await getPendingChatsApi({ page: 1, limit: 20 });

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.chat.getpPendingChats, {
      page: 1,
      limit: 20,
    });
  });

  it('POST /chat/chat-request-action – accept/reject payload shape', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { statusCode: 200 } });

    await setChatRequestActionApi({ chatId: 'chat-123', action: 'accept' });
    expect(apiClient.post).toHaveBeenCalledWith(endpoints.chat.setRequestAction, {
      chatId: 'chat-123',
      action: 'accept',
    });

    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { statusCode: 200 } });
    await setChatRequestActionApi({ chatId: 'chat-456', action: 'reject' });
    expect(apiClient.post).toHaveBeenCalledWith(endpoints.chat.setRequestAction, {
      chatId: 'chat-456',
      action: 'reject',
    });
  });

  it('POST /chat/send-message – text message payload shape', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { statusCode: 200, data: { _id: 'msg-1' } } });

    const payload = {
      chatId: 'chat-1',
      content: 'Hello',
      messageType: 'text' as const,
      files: [],
      replyTo: null,
    };
    await sendMessageApi(payload);

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.chat.sendMessage, {
      chatId: 'chat-1',
      content: 'Hello',
      messageType: 'text',
      files: [],
      replyTo: null,
    });
  });

  it('POST /chat/send-message – with reply and files', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { statusCode: 200 } });

    await sendMessageApi({
      chatId: 'c1',
      content: 'Reply text',
      messageType: 'text',
      files: [{ url: 'https://s3/url', key: 'key' }],
      replyTo: 'msg-parent-id',
    });

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.chat.sendMessage, {
      chatId: 'c1',
      content: 'Reply text',
      messageType: 'text',
      files: [{ url: 'https://s3/url', key: 'key' }],
      replyTo: 'msg-parent-id',
    });
  });

  it('POST /aws-s3-files/upload – FormData and timeout 60000', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { url: 'https://bucket.s3/photo.jpg', key: 'photos/photo.jpg' },
    });

    const result = await uploadChatFileApi('/path/to/file.jpg', {
      mimeType: 'image/jpeg',
      fileName: 'photo.jpg',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      endpoints.chat.fileUpload,
      expect.any(FormData),
      expect.objectContaining({
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
    expect(result.url).toBe('https://bucket.s3/photo.jpg');
    expect(result.key).toBe('photos/photo.jpg');
  });

  it('POST /aws-s3-files/upload – throws when response missing url or key', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: {} });

    await expect(
      uploadChatFileApi('file:///local.jpg', { mimeType: 'image/jpeg', fileName: 'x.jpg' })
    ).rejects.toThrow('Upload response missing url or key');
  });
});

describe('Interceptors (QA: request headers, 401 refresh, timeout)', () => {
  const requestUse = () => (apiClient.interceptors.request as any).use;
  const responseUse = () => (apiClient.interceptors.response as any).use;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('request: adds Authorization when token present', () => {
    authStore.getState.mockReturnValue({
      accessToken: 'my-token',
      refreshToken: 'rt',
      setTokens: mockSetTokens,
      logout: mockLogout,
    });

    setupInterceptors();
    const requestFulfilled = requestUse().mock.calls[requestUse().mock.calls.length - 1][0];
    const config = { headers: {} as Record<string, string> };
    const out = requestFulfilled(config);

    expect(out.headers.Authorization).toBe('Bearer my-token');
    expect(out.headers['x-api-key']).toBe('test-api-key');
  });

  it('request: adds x-api-key when env.API_KEY set', () => {
    authStore.getState.mockReturnValue({
      accessToken: null,
      refreshToken: null,
      setTokens: mockSetTokens,
      logout: mockLogout,
    });

    setupInterceptors();
    const requestFulfilled = requestUse().mock.calls[requestUse().mock.calls.length - 1][0];
    const config = { headers: {} as Record<string, string> };
    requestFulfilled(config);

    expect(config.headers['x-api-key']).toBe('test-api-key');
  });

  it('response 401: triggers refresh and retries request', async () => {
    authStore.getState.mockReturnValue({
      accessToken: 'old-at',
      refreshToken: 'old-rt',
      setTokens: mockSetTokens,
      logout: mockLogout,
    });

    setupInterceptors();
    const responseErrorHandler = responseUse().mock.calls[responseUse().mock.calls.length - 1][1];

    (apiClient.post as jest.Mock)
      .mockResolvedValueOnce({
        data: { data: { accessToken: 'new-at', refreshToken: 'new-rt' } },
      })
      .mockResolvedValueOnce({ data: { success: true } });

    (apiClient.request as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

    const originalRequest = { _retry: false, headers: {} as Record<string, string> };
    const error = { response: { status: 401 }, config: originalRequest };

    const resultPromise = responseErrorHandler(error);

    await expect(resultPromise).resolves.toEqual({ data: { success: true } });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-rt' });
    expect(mockSetTokens).toHaveBeenCalledWith('new-at', 'new-rt');
    expect(originalRequest.headers.Authorization).toBe('Bearer new-at');
  });

  it('response 401: logout when refresh fails', async () => {
    authStore.getState.mockReturnValue({
      accessToken: 'at',
      refreshToken: 'rt',
      setTokens: mockSetTokens,
      logout: mockLogout,
    });

    setupInterceptors();
    const responseErrorHandler = responseUse().mock.calls[responseUse().mock.calls.length - 1][1];

    const postMock = apiClient.post as jest.Mock;
    postMock.mockReset();
    postMock.mockRejectedValue(new Error('Refresh failed'));

    const originalRequest = { _retry: false, headers: {} as Record<string, string> };
    const error = { response: { status: 401 }, config: originalRequest };

    try {
      await responseErrorHandler(error);
    } catch {
      // Expected: handler rejects when refresh fails
    }
    expect(postMock).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt' });
    expect(mockLogout).toHaveBeenCalled();
  });

  it('timeout: triggers timeout modal callback with retry that re-calls request', async () => {
    setupInterceptors();
    const responseErrorHandler = responseUse().mock.calls[responseUse().mock.calls.length - 1][1];

    mockShowTimeout.mockImplementation((retry: () => void) => {
      retry();
    });
    (apiClient.request as jest.Mock).mockResolvedValueOnce({ data: {} });

    const originalRequest = { url: '/some/api' };
    const error = {
      code: 'ECONNABORTED',
      message: 'timeout',
      config: originalRequest,
    };

    await expect(responseErrorHandler(error)).rejects.toMatchObject({
      code: 'ECONNABORTED',
    });
    expect(mockShowTimeout).toHaveBeenCalledWith(expect.any(Function));
    const retryCb = mockShowTimeout.mock.calls[0][0];
    retryCb();
    expect(apiClient.request).toHaveBeenCalledWith(originalRequest);
  });
});
