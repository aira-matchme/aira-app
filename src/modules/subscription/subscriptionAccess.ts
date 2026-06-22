/** Profile fields used for premium access (source of truth). */
export type ProfileSubscriptionFields = {
  hasActiveSubscription?: boolean;
  premiumUntil?: string | null;
};

/** Premium access follows `hasActiveSubscription` from GET /auth/profile. */
export function resolveHasActiveSubscription(
  profile: ProfileSubscriptionFields | Record<string, unknown> | null | undefined,
): boolean {
  return profile?.hasActiveSubscription === true;
}

export function resolvePremiumUntil(
  profile: ProfileSubscriptionFields | Record<string, unknown> | null | undefined,
): string | null {
  const value = profile?.premiumUntil;
  return typeof value === 'string' && value.length > 0 ? value : null;
}
