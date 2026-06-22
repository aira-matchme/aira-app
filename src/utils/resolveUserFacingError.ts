import axios from 'axios';

import { STRINGS } from '../constants/strings';

const TECHNICAL_MESSAGE_PATTERNS = [
  /^request failed with status code \d+$/i,
  /^network error$/i,
  /^timeout of \d+ms exceeded$/i,
  /^axioserror/i,
];

export type UserFacingErrorContext = 'generic' | 'subscription' | 'purchase';

const CONTEXT_FALLBACK: Record<UserFacingErrorContext, string> = {
  generic: STRINGS.GENERAL.ERROR_TRY_AGAIN,
  subscription:
    "We couldn't load your subscription details right now. Please try again.",
  purchase:
    "We couldn't complete your purchase right now. Please try again in a moment.",
};

function isTechnicalMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  return TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function messageFromStatus(status?: number, context: UserFacingErrorContext = 'generic'): string {
  if (!status) {
    return CONTEXT_FALLBACK[context];
  }

  if (status >= 500) {
    return context === 'generic'
      ? "We couldn't complete your request right now. Please try again in a moment."
      : CONTEXT_FALLBACK[context];
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (status === 404) {
    return "We couldn't find what you're looking for. Please try again.";
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  if (status === 401) {
    return 'Please sign in and try again.';
  }

  if (status >= 400) {
    return CONTEXT_FALLBACK[context];
  }

  return CONTEXT_FALLBACK[context];
}

function readBackendMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const candidates = [record.message, record.error];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() && !isTechnicalMessage(candidate)) {
      return candidate.trim();
    }
  }

  return null;
}

export function resolveUserFacingError(
  error: unknown,
  context: UserFacingErrorContext = 'generic',
): string {
  const fallback = CONTEXT_FALLBACK[context];

  if (axios.isAxiosError(error)) {
    const backendMessage = readBackendMessage(error.response?.data);
    if (backendMessage) {
      return backendMessage;
    }

    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      return STRINGS.GENERAL.NO_INTERNET_MESSAGE;
    }

    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      return 'This is taking longer than expected. Please try again.';
    }

    return messageFromStatus(error.response?.status, context);
  }

  if (error instanceof Error) {
    const message = error.message?.trim() ?? '';
    if (message.includes('Missing') && message.toLowerCase().includes('token')) {
      return context === 'purchase'
        ? "We couldn't verify your purchase. Please try again or restore purchases."
        : fallback;
    }
    if (message && !isTechnicalMessage(message)) {
      return message;
    }
  }

  if (typeof error === 'string' && error.trim() && !isTechnicalMessage(error)) {
    return error.trim();
  }

  return fallback;
}
