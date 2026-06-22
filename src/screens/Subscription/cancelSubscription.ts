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
