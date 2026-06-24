export interface IapApiResponse<T = Record<string, unknown>> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface RegisterAppAccountTokenRequest {
  appAccountToken: string;
}

export interface SyncApplePurchaseRequest {
  signedTransactionInfo: string;
  signedRenewalInfo?: string;
}

export interface SyncGooglePurchaseRequest {
  purchaseToken: string;
}

export interface IapSubscriptionStatus {
  status?: string;
}

export interface IapEntitlement {
  _id: string;
  userId: string;
  platform: 'apple' | 'google' | string;
  originalTransactionId?: string;
  productId: string;
  basePlanId?: string | null;
  offerId?: string | null;
  subscriptionGroupIdentifier?: string | null;
  packageName?: string | null;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  gracePeriodEnd?: string | null;
  autoRenewEnabled?: boolean;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  userCancelRequestedAt?: string | null;
  userCancelReason?: string | null;
  environment?: string;
  appAccountToken?: string | null;
  lastStoreUpdateAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** GET /iap/entitlements — array of store entitlements for manage-subscription UI. */
export type IapEntitlementsResponse = IapApiResponse<IapEntitlement[]>;

/** @deprecated Legacy wrapped shape — use IapEntitlement[] via normalizeEntitlements. */
export interface IapEntitlementsData {
  isPremium?: boolean;
  tier?: 'free' | 'premium';
  expiresAt?: string;
  productId?: string;
  platform?: 'ios' | 'android';
  subscriptions?: IapSubscriptionStatus[];
}

export interface IapTransactionItem {
  id?: string;
  productId?: string;
  platform?: string;
  purchasedAt?: string;
  status?: string;
}

export interface IapTransactionsData {
  list?: IapTransactionItem[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export type IapTransactionsResponse = IapApiResponse<IapTransactionsData>;

export type RegisterAppAccountTokenResponse = IapApiResponse;
export type SyncApplePurchaseResponse = IapApiResponse;
export type SyncGooglePurchaseResponse = IapApiResponse;

export interface CancelSubscriptionRequest {
  reason: string;
}

export interface CancelSubscriptionResponseData {
  ok: boolean;
  subscriptionId: string;
  accessUntil: string;
  status: string;
  autoRenewEnabled: boolean;
}

export type CancelSubscriptionResponse = IapApiResponse<CancelSubscriptionResponseData>;
