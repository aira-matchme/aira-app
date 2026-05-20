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

export interface IapEntitlementsData {
  isPremium?: boolean;
  tier?: 'free' | 'premium';
  expiresAt?: string;
  productId?: string;
  platform?: 'ios' | 'android';
  /** Legacy/alternate backend shape */
  subscriptions?: IapSubscriptionStatus[];
}

export type IapEntitlementsResponse = IapApiResponse<IapEntitlementsData>;

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
