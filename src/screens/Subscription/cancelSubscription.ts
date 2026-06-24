export const CANCEL_SUBSCRIPTION_REASONS = [
  { id: 'technical_issues', label: 'Technical Issues' },
  { id: 'not_using_enough', label: "I don't use this service enough" },
  { id: 'found_better_app', label: 'I found a better app' },
  { id: 'too_expensive', label: 'Cost-related Issue' },
  { id: 'other', label: 'Other' },
] as const;

export type CancelSubscriptionReasonId =
  (typeof CANCEL_SUBSCRIPTION_REASONS)[number]['id'];

export const SUPPORT_EMAIL_URL = 'mailto:support@airamatchme.com';

const CANCEL_REASON_MAX_LENGTH = 120;

/** Maps UI selection to POST /iap/cancel-request `reason` (max 120 chars). */
export function buildCancelSubscriptionApiReason(
  reasonId: CancelSubscriptionReasonId,
  otherReason?: string,
): string {
  if (reasonId === 'other') {
    return (otherReason ?? '').trim().slice(0, CANCEL_REASON_MAX_LENGTH);
  }
  return reasonId.slice(0, CANCEL_REASON_MAX_LENGTH);
}
