import { Platform } from 'react-native';
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  getTransactionJwsIOS,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases,
  type EventSubscription,
  type ProductSubscription,
  type ProductSubscriptionAndroid,
  type Purchase,
  type PurchaseError,
  type PurchaseIOS,
} from 'react-native-iap';

import {
  getIapEntitlementsApi,
  getIapTransactionsApi,
  registerAppAccountTokenApi,
  syncApplePurchaseApi,
  syncGooglePurchaseApi,
} from '../../modules/iap/api';
import type {
  IapEntitlementsResponse,
  IapTransactionsResponse,
} from '../../modules/iap/types';

/** Store product IDs — must match App Store Connect & Google Play Console. */
export const SUBSCRIPTION_SKUS = Platform.select({
  ios: [
    'premium_monthly_new'
  ],
  android: [
     'premium_monthly'
  ],
  default: [],
}) as string[];

export const PREMIUM_MONTHLY_SKU = SUBSCRIPTION_SKUS[0] ?? '';

function createAppAccountToken(): string {
  const segment = (length: number) =>
    Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');

  return [
    segment(8),
    segment(4),
    `4${segment(3)}`,
    `${((Math.random() * 4) | 8).toString(16)}${segment(3)}`,
    segment(12),
  ].join('-');
}

function isPurchaseIOS(purchase: Purchase): purchase is PurchaseIOS {
  return purchase.store === 'apple';
}

/** Open billing connection — call once before any IAP operation. */
export async function connectIap(): Promise<void> {
  await initConnection();
}

/** Close billing connection — call on unmount / logout. */
export async function disconnectIap(): Promise<void> {
  await endConnection();
}

export type SubscriptionProductsLoadResult = {
  products: ProductSubscription[];
  diagnostics: string[];
};

function hasAndroidPurchasableOffers(
  product: ProductSubscriptionAndroid,
): boolean {
  const offerCount =
    product.subscriptionOffers?.length ??
    product.subscriptionOfferDetailsAndroid?.length ??
    0;
  return offerCount > 0;
}

/** Load subscription products from the store (localized prices). */
export async function loadSubscriptionProducts(): Promise<SubscriptionProductsLoadResult> {
  const diagnostics: string[] = [];
  const products = await fetchProducts({
    skus: SUBSCRIPTION_SKUS,
    type: 'subs',
  });

  if (!products?.length) {
    diagnostics.push(
      `Store returned no products for: ${SUBSCRIPTION_SKUS.join(', ')}`,
    );
    return { products: [], diagnostics };
  }

  const subs = (products as ProductSubscription[]).filter((product) => {
    if (product.type !== 'subs') return false;

    if (product.platform !== 'android') return true;

    const android = product as ProductSubscriptionAndroid;
    const status = android.productStatusAndroid;
    if (status && status !== 'ok') {
      diagnostics.push(`${product.id}: ${status}`);
      return false;
    }

    if (!hasAndroidPurchasableOffers(android)) {
      diagnostics.push(
        `${product.id}: no offers for this Play account region (check base plan countries)`,
      );
      return false;
    }

    return true;
  });

  if (subs.length === 0) {
    diagnostics.push(
      'Subscription exists in console but is not available for this device/account.',
    );
  }

  if (__DEV__) {
    console.log('[IAP] fetchProducts', {
      requested: SUBSCRIPTION_SKUS,
      returned: products.map((p) => p.id),
      purchasable: subs.map((p) => p.id),
      diagnostics,
    });
  }

  return { products: subs, diagnostics };
}

/**
 * iOS — register appAccountToken with backend, then return it for StoreKit.
 * Call before `purchaseSubscription` on iOS.
 */
export async function prepareIosAppAccountToken(): Promise<string> {
  const appAccountToken = createAppAccountToken();
  await registerAppAccountTokenApi({ appAccountToken });
  return appAccountToken;
}

/** Start subscription purchase flow; result arrives via purchase listeners. */
export type PurchaseSubscriptionOptions = {
  appAccountToken?: string;
  /** Android — base-plan offer token from `subscriptionOfferDetailsAndroid`. */
  androidOfferToken?: string;
  /** Android — links purchase to your user id (obfuscated account id). */
  obfuscatedAccountIdAndroid?: string;
};

export async function purchaseSubscription(
  sku: string,
  options?: PurchaseSubscriptionOptions,
): Promise<void> {
  await requestPurchase({
    type: 'subs',
    request: {
      apple: {
        sku,
        ...(options?.appAccountToken
          ? { appAccountToken: options.appAccountToken }
          : {}),
      },
      google: {
        skus: [sku],
        ...(options?.androidOfferToken
          ? {
              subscriptionOffers: [
                { sku, offerToken: options.androidOfferToken },
              ],
            }
          : {}),
        ...(options?.obfuscatedAccountIdAndroid
          ? { obfuscatedAccountId: options.obfuscatedAccountIdAndroid }
          : {}),
      },
    },
  });
}

export function onPurchaseUpdated(
  listener: (purchase: Purchase) => void,
): EventSubscription {
  return purchaseUpdatedListener(listener);
}

export function onPurchaseError(
  listener: (error: PurchaseError) => void,
): EventSubscription {
  return purchaseErrorListener(listener);
}

/** Finalize transaction after backend verification succeeds. */
export async function finalizePurchase(purchase: Purchase): Promise<void> {
  await finishTransaction({ purchase, isConsumable: false });
}

/** Sync a completed purchase with the backend (platform-specific). */
export async function syncPurchaseWithBackend(
  purchase: Purchase,
): Promise<void> {
  if (Platform.OS === 'ios' || isPurchaseIOS(purchase)) {
    const iosPurchase = isPurchaseIOS(purchase) ? purchase : null;
    const signedTransactionInfo =
      purchase.purchaseToken ??
      (await getTransactionJwsIOS(purchase.productId)) ??
      '';

    if (!signedTransactionInfo) {
      throw new Error('Missing iOS signed transaction info');
    }

    const signedRenewalInfo =
      iosPurchase?.renewalInfoIOS?.jsonRepresentation ?? undefined;

    await syncApplePurchaseApi({
      signedTransactionInfo,
      signedRenewalInfo,
    });
    return;
  }

  const purchaseToken = purchase.purchaseToken?.trim();
  if (!purchaseToken) {
    throw new Error('Missing Google Play purchase token');
  }

  await syncGooglePurchaseApi({ purchaseToken });
}

/** Restore store purchases, then sync each with backend. */
export async function restoreAndSyncPurchases(): Promise<Purchase[]> {
  await restorePurchases();
  const purchases = await getAvailablePurchases();
  for (const purchase of purchases) {
    await syncPurchaseWithBackend(purchase);
    await finalizePurchase(purchase);
  }
  return purchases;
}

export async function fetchEntitlements(): Promise<IapEntitlementsResponse> {
  return getIapEntitlementsApi();
}

export async function fetchTransactionHistory(
  page = 1,
  limit = 20,
): Promise<IapTransactionsResponse> {
  return getIapTransactionsApi(page, limit);
}
