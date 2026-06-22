import type { IapEntitlement, IapEntitlementsResponse } from './types';

export function normalizeEntitlements(
  response: IapEntitlementsResponse | null | undefined,
): IapEntitlement[] {
  const data = response?.data;
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

/** Prefer an active/grace entitlement for manage-subscription UI. */
export function pickPrimaryEntitlement(
  entitlements: IapEntitlement[],
): IapEntitlement | null {
  if (entitlements.length === 0) return null;

  const ranked = [...entitlements].sort((a, b) => {
    const score = (item: IapEntitlement) => {
      if (item.status === 'active') return 0;
      if (item.status === 'grace_period') return 1;
      return 2;
    };
    return score(a) - score(b);
  });

  return ranked[0] ?? null;
}

export function formatSubscriptionDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** UK monthly AIRA Plus price (GBP) — canonical display price for manage UI. */
export const DEFAULT_SUBSCRIPTION_PRICE_GBP = 8.99;

const MIN_PLAUSIBLE_MONTHLY_GBP = 1;
const MAX_PLAUSIBLE_MONTHLY_GBP = 50;

function normalizePriceNumberString(value: string): string {
  let normalized = value.replace(/\s*\/\s*mo(?:nth)?$/i, '').trim();
  normalized = normalized.replace(/[£$€\s]/g, '');

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && !hasDot) {
    return normalized.replace(',', '.');
  }

  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');
    if (lastComma > lastDot) {
      return normalized.replace(/\./g, '').replace(',', '.');
    }
    return normalized.replace(/,/g, '');
  }

  return normalized;
}

function parseDisplayPriceAmount(displayPrice?: string | null): number | null {
  if (!displayPrice) return null;

  const normalized = normalizePriceNumberString(displayPrice);
  const numeric = Number.parseFloat(normalized.replace(/[^0-9.]/g, ''));

  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric;
}

function resolveSubscriptionPriceAmount(displayPrice?: string | null): number {
  const parsed = parseDisplayPriceAmount(displayPrice);
  if (
    parsed != null &&
    parsed >= MIN_PLAUSIBLE_MONTHLY_GBP &&
    parsed <= MAX_PLAUSIBLE_MONTHLY_GBP
  ) {
    return parsed;
  }
  return DEFAULT_SUBSCRIPTION_PRICE_GBP;
}

/** Format subscription price in GBP, e.g. `£8.99` or `£8.99/month`. */
export function formatSubscriptionAmountGBP(
  displayPrice?: string | null,
  options?: { perMonth?: boolean },
): string {
  const amount = resolveSubscriptionPriceAmount(displayPrice);
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return options?.perMonth ? `${formatted}/month` : formatted;
}

export function formatProductLabel(productId: string | null | undefined): string {
  if (!productId) return 'Monthly';
  const segment = productId.split('.').pop() ?? productId;
  const normalized = segment.replace(/[_-]/g, ' ').toLowerCase();
  if (normalized.includes('month')) return 'Monthly';
  if (normalized.includes('year') || normalized.includes('annual')) return 'Yearly';
  return segment
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatRelativeRenewal(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return null;

  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Ended';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'In 1 day';
  return `In ${diffDays} days`;
}

export function getPlanStatusLabel(
  entitlement: IapEntitlement | null,
  hasActiveSubscription: boolean,
): { label: string; tone: 'active' | 'cancelled' | 'ended' } {
  if (!hasActiveSubscription) {
    return { label: 'Ended', tone: 'ended' };
  }

  const cancelled =
    Boolean(entitlement?.cancelledAt) || entitlement?.autoRenewEnabled === false;

  if (cancelled) {
    return { label: 'Active', tone: 'cancelled' };
  }

  return { label: 'Active', tone: 'active' };
}

export function buildRenewalBannerText(
  entitlement: IapEntitlement | null,
  hasActiveSubscription: boolean,
  amountLabel: string,
): string {
  const renewDate = formatSubscriptionDate(entitlement?.currentPeriodEnd);
  const relative = formatRelativeRenewal(entitlement?.currentPeriodEnd);
  const cancelled =
    Boolean(entitlement?.cancelledAt) || entitlement?.autoRenewEnabled === false;

  if (!hasActiveSubscription) {
    return `Your premium access ended on ${renewDate}.`;
  }

  if (cancelled) {
    return `Your plan stays active until ${renewDate}. Auto-renew is off.`;
  }

  const relativePart = relative ? relative.toLowerCase() : 'soon';
  return `Your plan renews ${relativePart} on ${renewDate}. You'll be charged ${amountLabel} automatically.`;
}

export function getStoreManageSubscriptionsUrl(platform: string): string {
  if (platform === 'google' || platform === 'android') {
    return 'https://play.google.com/store/account/subscriptions';
  }
  return 'https://apps.apple.com/account/subscriptions';
}

export function getManageSubscriptionStatusLabel(
  entitlement: IapEntitlement,
  hasActiveSubscription: boolean,
): { title: string; subtitle: string } {
  const accessUntil = formatSubscriptionDate(entitlement.currentPeriodEnd);
  const cancelled = Boolean(entitlement.cancelledAt) || entitlement.autoRenewEnabled === false;

  if (hasActiveSubscription && cancelled) {
    return {
      title: 'Premium active',
      subtitle: `Cancelled — you keep premium access until ${accessUntil}.`,
    };
  }

  if (hasActiveSubscription && entitlement.autoRenewEnabled) {
    return {
      title: 'Premium active',
      subtitle: `Renews on ${accessUntil}.`,
    };
  }

  if (hasActiveSubscription) {
    return {
      title: 'Premium active',
      subtitle: `Access until ${accessUntil}.`,
    };
  }

  return {
    title: 'Subscription ended',
    subtitle: `Access ended on ${accessUntil}.`,
  };
}
