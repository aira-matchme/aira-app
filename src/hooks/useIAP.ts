import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
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
import type { IapEntitlementsResponse } from '../modules/iap/types';
import { useSubscriptionStore } from '../store/subscription.store';

function isUserCancelled(error: unknown): boolean {
  const code = String((error as PurchaseError)?.code ?? '');
  return code === 'user-cancelled' || code === 'E_USER_CANCELLED';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong. Please try again.';
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
  if (data?.isPremium === true || data?.tier === 'premium') {
    return true;
  }
  return (
    data?.subscriptions?.some(
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
}

export function useIAP(options: UseIapOptions = {}) {
  const { enabled = true } = options;

  const [subscriptions, setSubscriptions] = useState<ProductSubscription[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productsHint, setProductsHint] = useState<string | null>(null);

  const setSubscription = useSubscriptionStore((s) => s.setSubscription);
  const clearSubscription = useSubscriptionStore((s) => s.clearSubscription);

  const subscriptionsRef = useRef<ProductSubscription[]>([]);

  const applyPremiumState = useCallback(
    (premium: boolean) => {
      setIsPremium(premium);
      if (premium) {
        setSubscription('premium');
      } else {
        clearSubscription();
      }
    },
    [clearSubscription, setSubscription],
  );

  const checkPremiumStatus = useCallback(async () => {
    try {
      const response = await fetchEntitlements();
      applyPremiumState(resolvePremiumFromEntitlements(response));
    } catch (err) {
      console.error('Entitlements check failed:', err);
    }
  }, [applyPremiumState]);

  const handlePurchase = useCallback(
    async (purchase: Purchase) => {
      try {
        await syncPurchaseWithBackend(purchase);
        await finalizePurchase(purchase);
        await checkPremiumStatus();
        setIsLoading(false);
      } catch (err) {
        console.error('Purchase handling failed:', err);
        setError(getErrorMessage(err));
        setIsLoading(false);
      }
    },
    [checkPremiumStatus],
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
        await checkPremiumStatus();

        purchaseListener = onPurchaseUpdated((purchase) => {
          void handlePurchaseRef.current(purchase);
        });

        errorListener = onPurchaseError((err) => {
          if (!isUserCancelled(err)) {
            setError(err.message);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error('IAP setup error:', err);
        setError(getErrorMessage(err));
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
  }, [enabled, checkPremiumStatus]);

  const buySubscription = useCallback(
    async (productId: string, userId?: string) => {
      try {
        setIsLoading(true);
        setError(null);

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
          setError(getErrorMessage(err));
        }
        setIsLoading(false);
      }
    },
    [],
  );

  const restorePurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const purchases = await restoreAndSyncPurchases();
      const active = purchases.find((p) =>
        SUBSCRIPTION_SKUS.includes(p.productId),
      );

      if (active) {
        await checkPremiumStatus();
        Alert.alert('Restored', 'Your subscription has been restored.');
      } else {
        Alert.alert(
          'No subscription found',
          'We could not find an active subscription for this account.',
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [checkPremiumStatus]);

  const reloadProducts = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);
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
      setError(getErrorMessage(err));
    } finally {
      setIsInitializing(false);
    }
  }, []);

  return {
    subscriptions,
    isInitializing,
    isLoading,
    isPremium,
    error,
    productsHint,
    buySubscription,
    restorePurchases,
    checkPremiumStatus,
    reloadProducts,
  };
}
