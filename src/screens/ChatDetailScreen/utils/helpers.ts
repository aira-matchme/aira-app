import { Platform } from 'react-native';
import type { KeyboardEvent } from 'react-native';

export const now = () => {
  const d = new Date();
  return `${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
};

export function isAiraLimitError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
  const msg = ((data?.message ?? data?.error) ?? '').toString().toLowerCase();
  return status === 429 || msg.includes('limit') || msg.includes('suggestion') || msg.includes('quota');
}

export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const n = new Date();
  const midnight = new Date(n);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - n.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

export function parseAiraTimeLeft(
  value: string | null | undefined
): { hours: number; minutes: number; seconds: number } | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    minutes > 59 ||
    seconds > 59
  ) {
    return null;
  }
  return { hours, minutes, seconds };
}

export function decrementCountdown(prev: { hours: number; minutes: number; seconds: number }) {
  const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds;
  if (total <= 0) return prev;
  const next = total - 1;
  return {
    hours: Math.floor(next / 3600),
    minutes: Math.floor((next % 3600) / 60),
    seconds: next % 60,
  };
}

export function formatMessageTimestamp(value: string | number | undefined): string {
  if (value == null) return now();
  const d = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return now();
  const h = d.getHours();
  const m = d.getMinutes();
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function extractChatIdFromAddChatResponse(addRes: { data?: unknown }): string | null {
  const body = addRes?.data as Record<string, unknown> | undefined;
  if (!body) return null;
  const inner = body.data as Record<string, unknown> | undefined;
  const chat = inner?.chat as Record<string, unknown> | undefined;
  const fromChat = chat?.id ?? chat?._id;
  if (typeof fromChat === 'string' && fromChat.length > 0) return fromChat;
  if (inner) {
    for (const key of ['chatId', 'id', '_id'] as const) {
      const v = inner[key];
      if (typeof v === 'string' && v.length > 0) return v;
    }
  }
  for (const key of ['chatId', 'id', '_id'] as const) {
    const v = body[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return null;
}

export function keyboardOverlapFromEvent(windowHeight: number, e: KeyboardEvent): number {
  const ec = e.endCoordinates;
  if (!ec || windowHeight <= 0) return 0;

  if (Platform.OS === 'ios') {
    const screenY = typeof ec.screenY === 'number' ? ec.screenY : windowHeight;
    return Math.max(0, Math.min(windowHeight, windowHeight - screenY));
  }

  const fromHeight = typeof ec.height === 'number' && ec.height > 0 ? ec.height : 0;
  const fromScreenY =
    typeof ec.screenY === 'number' ? Math.max(0, windowHeight - ec.screenY) : 0;

  const maxReasonableKeyboard = Math.floor(windowHeight * 0.45);
  const minReasonableKeyboard = 80;
  const candidates = [fromHeight, fromScreenY].filter(
    (v) => v >= minReasonableKeyboard && v <= maxReasonableKeyboard
  );
  if (candidates.length > 0) {
    return Math.min(...candidates);
  }

  const raw = Math.max(fromHeight, fromScreenY);
  if (raw <= 0) return 0;
  if (fromScreenY > 0) {
    return Math.min(maxReasonableKeyboard, fromScreenY);
  }
  return Math.min(maxReasonableKeyboard, Math.max(minReasonableKeyboard, raw));
}

export function firstNonEmptyString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return undefined;
}
