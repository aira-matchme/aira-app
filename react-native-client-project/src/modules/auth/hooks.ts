import { useMutation, useQuery } from '@tanstack/react-query';
import { loginApi } from './api';
import { LoginRequest, AuthResponse } from './types';

export const useLogin = () =>
  useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: loginApi,
  });

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });
