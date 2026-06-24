import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import type {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  IapEntitlementsResponse,
  IapTransactionsResponse,
  RegisterAppAccountTokenRequest,
  RegisterAppAccountTokenResponse,
  SyncApplePurchaseRequest,
  SyncApplePurchaseResponse,
  SyncGooglePurchaseRequest,
  SyncGooglePurchaseResponse,
} from './types';

/** iOS — register StoreKit `appAccountToken` before starting a purchase. */
export const registerAppAccountTokenApi = async (
  payload: RegisterAppAccountTokenRequest,
): Promise<RegisterAppAccountTokenResponse> => {
  const { data } = await apiClient.post<RegisterAppAccountTokenResponse>(
    endpoints.iap.appleAppAccountToken,
    payload,
  );
  return data;
};

/** iOS — sync signed StoreKit transaction to backend after purchase. */
export const syncApplePurchaseApi = async (
  payload: SyncApplePurchaseRequest,
): Promise<SyncApplePurchaseResponse> => {
  const { data } = await apiClient.post<SyncApplePurchaseResponse>(
    endpoints.iap.appleSync,
    {
      signedTransactionInfo: payload.signedTransactionInfo,
      ...(payload.signedRenewalInfo
        ? { signedRenewalInfo: payload.signedRenewalInfo }
        : {}),
    },
  );
  return data;
};

/** Android — sync Google Play purchase token to backend after purchase. */
export const syncGooglePurchaseApi = async (
  payload: SyncGooglePurchaseRequest,
): Promise<SyncGooglePurchaseResponse> => {
  const { data } = await apiClient.post<SyncGooglePurchaseResponse>(
    endpoints.iap.googleSync,
    payload,
  );
  return data;
};

/** Current premium entitlements for the logged-in user. */
export const getIapEntitlementsApi =
  async (): Promise<IapEntitlementsResponse> => {
    const { data } = await apiClient.get<IapEntitlementsResponse>(
      endpoints.iap.entitlements,
    );
    return data;
  };

/** Paginated IAP transaction history. */
export const getIapTransactionsApi = async (
  page = 1,
  limit = 20,
): Promise<IapTransactionsResponse> => {
  const { data } = await apiClient.get<IapTransactionsResponse>(
    endpoints.iap.transactions,
    { params: { page, limit } },
  );
  return data;
};

/** Store cancellation reason before redirecting user to App / Play Store. */
export const postCancelSubscriptionRequestApi = async (
  payload: CancelSubscriptionRequest,
): Promise<CancelSubscriptionResponse> => {
  const { data } = await apiClient.post<CancelSubscriptionResponse>(
    endpoints.iap.cancelRequest,
    { reason: payload.reason.trim().slice(0, 120) },
  );
  return data;
};
