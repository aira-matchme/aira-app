import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import axios from 'axios';
import type {
  EventSubscription,
  ProductSubscription,
  ProductSubscriptionAndroid,
  Purchase,
  PurchaseError,
} from 'react-native-iap';

import {
  connectIap,
  disconnectIap,
  fetchEntitlements,
  finalizePurchase,
  loadSubscriptionProducts,
  onPurchaseError,
  onPurchaseUpdated,
  prepareIosAppAccountToken,
  purchaseSubscription,
  restoreAndSyncPurchases,
  SUBSCRIPTION_SKUS,
  syncPurchaseWithBackend,
} from '../services/Purchase/IAPService';
import type { IapEntitlement, IapEntitlementsResponse } from '../modules/iap/types';
import { refreshSubscriptionFromProfile } from '../modules/subscription/refreshSubscriptionFromProfile';
import { useSubscriptionStore } from '../store/subscription.store';
import { useApiErrorStore } from '../store/apiError.store';
import { resolveUserFacingError } from '../utils/resolveUserFacingError';

function isUserCancelled(error: unknown): boolean {
  const code = String((error as PurchaseError)?.code ?? '');
  return code === 'user-cancelled' || code === 'E_USER_CANCELLED';
}

function getErrorMessage(error: unknown): string {
  return resolveUserFacingError(error, 'purchase');
}

function reportNonApiError(error: unknown): void {
  if (axios.isAxiosError(error)) return;
  useApiErrorStore.getState().showError(getErrorMessage(error), { variant: 'generic' });
}

function getEmptyProductsHint(): string {
  if (Platform.OS === 'ios') {
    return (
      'App Store shows this subscription as "Missing Metadata". Add name, description, ' +
      'pricing, and a review screenshot in App Store Connect, then attach it to an app version. ' +
      'Test on a real device with a Sandbox Apple ID.'
    );
  }

  return (
    'Play Console: finish and publish the release (orange "Finish update"), install from ' +
    'internal/closed testing (not a debug APK), use a license tester account, and add your ' +
    'test country to the base plan — yours is UK only right now.'
  );
}

function resolvePremiumFromEntitlements(
  response: IapEntitlementsResponse,
): boolean {
  const data = response.data;
  if (Array.isArray(data)) {
    return data.some(
      (item) => item.status === 'active' || item.status === 'grace_period',
    );
  }
  const legacy = data as {
    isPremium?: boolean;
    tier?: string;
    subscriptions?: { status?: string }[];
  } | null | undefined;
  if (legacy?.isPremium === true || legacy?.tier === 'premium') {
    return true;
  }
  return (
    legacy?.subscriptions?.some(
      (s) => s.status === 'active' || s.status === 'grace_period',
    ) ?? false
  );
}

function getAndroidOfferToken(
  product: ProductSubscription,
): string | undefined {
  if (product.platform !== 'android') return undefined;
  const android = product as ProductSubscriptionAndroid;
  return (
    android.subscriptionOfferDetailsAndroid?.[0]?.offerToken ??
    android.subscriptionOffers?.[0]?.offerTokenAndroid ??
    undefined
  );
}

export interface UseIapOptions {
  /** When false, skips store connection (e.g. logged-out). Default true. */
  enabled?: boolean;
  /** When true, checks entitlements on mount (legacy UI only — access uses profile). Default false. */
  checkEntitlementsOnMount?: boolean;
}

export function useIAP(options: UseIapOptions = {}) {
  const { enabled = true, checkEntitlementsOnMount = false } = options;

  const [subscriptions, setSubscriptions] = useState<ProductSubscription[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(
    () => useSubscriptionStore.getState().isSubscribed,
  );
  const [productsHint, setProductsHint] = useState<string | null>(null);

  const subscriptionsRef = useRef<ProductSubscription[]>([]);

  const checkPremiumStatus = useCallback(async () => {
    try {
      const response = await fetchEntitlements();
      setIsPremium(resolvePremiumFromEntitlements(response));
    } catch (err) {
      console.error('Entitlements check failed:', err);
    }
  }, []);

  const refreshProfileSubscription = useCallback(async () => {
    try {
      await refreshSubscriptionFromProfile();
      setIsPremium(useSubscriptionStore.getState().isSubscribed);
    } catch (err) {
      console.error('Profile subscription refresh failed:', err);
    }
  }, []);

  const handlePurchase = useCallback(
    async (purchase: Purchase) => {
      try {
        await syncPurchaseWithBackend(purchase);
        await finalizePurchase(purchase);
        await refreshProfileSubscription();
        setIsLoading(false);
      } catch (err) {
        console.error('Purchase handling failed:', err);
        reportNonApiError(err);
        setIsLoading(false);
      }
    },
    [refreshProfileSubscription],
  );

  const handlePurchaseRef = useRef(handlePurchase);
  handlePurchaseRef.current = handlePurchase;

  useEffect(() => {
    subscriptionsRef.current = subscriptions;
  }, [subscriptions]);

  useEffect(() => {
    if (!enabled) return;

    let purchaseListener: EventSubscription | undefined;
    let errorListener: EventSubscription | undefined;

    const setup = async () => {
      try {
        setIsInitializing(true);
        await connectIap();
        const { products, diagnostics } = await loadSubscriptionProducts();
        setSubscriptions(products);
        subscriptionsRef.current = products;
        setProductsHint(
          products.length === 0 ? getEmptyProductsHint() : null,
        );
        if (__DEV__ && diagnostics.length > 0) {
          console.warn('[IAP] product diagnostics:', diagnostics);
        }
        if (checkEntitlementsOnMount) {
          await checkPremiumStatus();
        } else {
          setIsPremium(useSubscriptionStore.getState().isSubscribed);
        }

        purchaseListener = onPurchaseUpdated((purchase) => {
          void handlePurchaseRef.current(purchase);
        });

        errorListener = onPurchaseError((err) => {
          if (!isUserCancelled(err)) {
            reportNonApiError(err);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error('IAP setup error:', err);
        reportNonApiError(err);
      } finally {
        setIsInitializing(false);
      }
    };

    void setup();

    return () => {
      purchaseListener?.remove();
      errorListener?.remove();
      void disconnectIap();
    };
  }, [enabled, checkEntitlementsOnMount, checkPremiumStatus]);

  const buySubscription = useCallback(
    async (productId: string, userId?: string) => {
      try {
        setIsLoading(true);

        if (Platform.OS === 'ios') {
          const appAccountToken = await prepareIosAppAccountToken();
          await purchaseSubscription(productId, { appAccountToken });
          return;
        }

        const product = subscriptionsRef.current.find((s) => s.id === productId);
        const androidOfferToken = product
          ? getAndroidOfferToken(product)
          : undefined;

        await purchaseSubscription(productId, {
          androidOfferToken,
          obfuscatedAccountIdAndroid: userId,
        });
      } catch (err) {
        if (!isUserCancelled(err)) {
          reportNonApiError(err);
        }
        setIsLoading(false);
      }
    },
    [],
  );

  const restorePurchases = useCallback(async () => {
    try {
      setIsLoading(true);

      const purchases = await restoreAndSyncPurchases();
      const active = purchases.find((p) =>
        SUBSCRIPTION_SKUS.includes(p.productId),
      );

      if (active) {
        await refreshProfileSubscription();
        const subscribed = useSubscriptionStore.getState().isSubscribed;
        if (subscribed) {
          Alert.alert('Restored', 'Your subscription has been restored.');
        } else {
          Alert.alert(
            'No active subscription',
            'We found a purchase but your subscription is not active yet. Try again in a moment.',
          );
        }
      } else {
        Alert.alert(
          'No subscription found',
          'We could not find an active subscription for this account.',
        );
      }
    } catch (err) {
      reportNonApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfileSubscription]);

  const reloadProducts = useCallback(async () => {
    try {
      setIsInitializing(true);
      const { products, diagnostics } = await loadSubscriptionProducts();
      setSubscriptions(products);
      subscriptionsRef.current = products;
      setProductsHint(
        products.length === 0 ? getEmptyProductsHint() : null,
      );
      if (__DEV__ && diagnostics.length > 0) {
        console.warn('[IAP] product diagnostics:', diagnostics);
      }
    } catch (err) {
      reportNonApiError(err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  return {
    subscriptions,
    isInitializing,
    isLoading,
    isPremium,
    productsHint,
    buySubscription,
    restorePurchases,
    checkPremiumStatus,
    refreshProfileSubscription,
    reloadProducts,
  };
}
