import type { AxiosError } from 'axios';

type PremiumErrorBody = {
  statusCode?: number;
  message?: string;
  error?: string;
};

export function isPremiumRequiredError(error: unknown): boolean {
  const axiosError = error as AxiosError<PremiumErrorBody>;
  const status = axiosError?.response?.status;
  const data = axiosError?.response?.data;

  if (status !== 403) {
    return false;
  }

  if (data?.error === 'PREMIUM_REQUIRED') {
    return true;
  }

  const message = data?.message?.toLowerCase() ?? '';
  return message.includes('premium subscription required');
}
