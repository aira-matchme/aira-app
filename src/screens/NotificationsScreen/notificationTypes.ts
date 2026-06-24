export const NOTIFICATION_TYPE = {
  MATCH_FOUND: 'MATCH_FOUND',
  NEW_MESSAGE: 'NEW_MESSAGE',
  CHAT_REQUEST: 'CHAT_REQUEST',
  CHAT_ACCEPTED: 'CHAT_ACCEPTED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  AUTO_RENEW_DISABLED: 'AUTO_RENEW_DISABLED',
  GALLERY_COMPLETION_REMINDER: 'GALLERY_COMPLETION_REMINDER',
} as const;

export type NotificationIconKind =
  | 'subscription'
  | 'gallery'
  | 'match'
  | 'chat'
  | 'default';

const CHAT_NOTIFICATION_TYPES = new Set<string>([
  NOTIFICATION_TYPE.NEW_MESSAGE,
  NOTIFICATION_TYPE.CHAT_REQUEST,
  NOTIFICATION_TYPE.CHAT_ACCEPTED,
]);

const SUBSCRIPTION_NOTIFICATION_TYPES = new Set<string>([
  NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED,
  NOTIFICATION_TYPE.AUTO_RENEW_DISABLED,
]);

export const OPEN_CHAT_DETAIL_TYPES = CHAT_NOTIFICATION_TYPES;

/** Normalizes API `type` / `data.type` (SCREAMING_SNAKE or snake_case). */
export function normalizeNotificationType(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.replace(/-/g, '_').toUpperCase();
}

export function resolveNotificationIconKind(notificationType: string): NotificationIconKind {
  const type = normalizeNotificationType(notificationType);
  if (SUBSCRIPTION_NOTIFICATION_TYPES.has(type)) return 'subscription';
  if (type === NOTIFICATION_TYPE.GALLERY_COMPLETION_REMINDER) return 'gallery';
  if (type === NOTIFICATION_TYPE.MATCH_FOUND) return 'match';
  if (CHAT_NOTIFICATION_TYPES.has(type)) return 'chat';
  return 'default';
}

export function isSubscriptionNotification(notificationType: string): boolean {
  return SUBSCRIPTION_NOTIFICATION_TYPES.has(normalizeNotificationType(notificationType));
}

export function isGalleryCompletionReminder(notificationType: string): boolean {
  return (
    normalizeNotificationType(notificationType) ===
    NOTIFICATION_TYPE.GALLERY_COMPLETION_REMINDER
  );
}

export function shouldUseSenderAvatar(
  iconKind: NotificationIconKind,
  avatarUri: string | null,
): boolean {
  return Boolean(avatarUri) && (iconKind === 'match' || iconKind === 'chat');
}
