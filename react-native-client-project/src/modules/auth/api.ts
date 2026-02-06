import { apiClient } from '@services/api/client';
import { endpoints } from '@services/api/endpoints';
import { LoginRequest, AuthResponse } from '@modules/auth/types';

export const loginApi = async (
  payload: LoginRequest
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.login,
    payload
  );
  return data;
};
