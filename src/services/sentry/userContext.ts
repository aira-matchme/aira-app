import * as Sentry from '@sentry/react-native';

import type { User } from '../../store/auth.store';

export function syncSentryUser(user: User | null): void {
  if (!user?.id) {
    Sentry.setUser(null);
    Sentry.setTag('user_logged_in', 'false');
    return;
  }
  Sentry.setUser({
    id: String(user.id),
    email: user.email || undefined,
    username: user.name || undefined,
  });
  Sentry.setTag('user_logged_in', 'true');
  Sentry.setContext('auth_user', {
    id: String(user.id),
    email: user.email || undefined,
    name: user.name || undefined,
  });
}
