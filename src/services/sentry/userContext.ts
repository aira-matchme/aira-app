import * as Sentry from '@sentry/react-native';

import type { User } from '../../store/auth.store';

export function syncSentryUser(user: User | null): void {
  if (!user?.id) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({
    id: String(user.id),
    email: user.email || undefined,
    username: user.name || undefined,
  });
}
