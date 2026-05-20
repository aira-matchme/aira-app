import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProductSubscription } from 'react-native-iap';

import { ProfileScreenGradient } from '../../components/ProfileScreenGradient';
import { useIAP } from '../../hooks/useIAP';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme';
import { styles } from './styles';

const PREMIUM_FEATURES = [
  'Unlimited matches',
  'Unlimited likes',
  'See who liked you',
  'Profile boost',
  'Premium badge',
] as const;

function getPlanLabel(product: ProductSubscription): string {
  const id = product.id.toLowerCase();
  if (id.includes('year')) return 'Premium Yearly';
  if (id.includes('month')) return 'Premium Monthly';
  return product.title || 'Premium';
}

function getPlanPeriod(product: ProductSubscription): string {
  const id = product.id.toLowerCase();
  if (id.includes('year')) return 'per year';
  if (id.includes('month')) return 'per month';
  return 'auto-renewing';
}

export const SubscriptionScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    subscriptions,
    isInitializing,
    isLoading,
    isPremium,
    error,
    productsHint,
    buySubscription,
    restorePurchases,
    reloadProducts,
  } = useIAP({ enabled: isAuthenticated });

  const handleBuy = useCallback(
    (productId: string) => {
      void buySubscription(productId, user?.id);
    },
    [buySubscription, user?.id],
  );

  const storeLabel =
    Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  if (isInitializing) {
    return (
      <View style={styles.wrapper}>
        <ProfileScreenGradient />
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.purple} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (isPremium) {
    return (
      <View style={styles.wrapper}>
        <ProfileScreenGradient />
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.center}>
          <Text style={styles.premiumEmoji}>👑</Text>
          <Text style={styles.premiumTitle}>You&apos;re Premium</Text>
          <Text style={styles.premiumSubtitle}>
            Enjoy all premium features on Aira Match
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>
            Unlock unlimited matches and more
          </Text>

          <View style={styles.featuresList}>
            {PREMIUM_FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureDot}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {subscriptions.length === 0 ? (
            <View style={styles.unavailableBlock}>
              <Text style={styles.errorText}>
                Subscription plans are unavailable right now.
              </Text>
              {productsHint ? (
                <Text style={styles.hintText}>{productsHint}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => void reloadProducts()}
                disabled={isLoading || isInitializing}
                activeOpacity={0.7}
              >
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            subscriptions.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.planCard,
                  isLoading && styles.planCardDisabled,
                ]}
                onPress={() => handleBuy(product.id)}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.planName}>{getPlanLabel(product)}</Text>
                <Text style={styles.planPrice}>{product.displayPrice}</Text>
                <Text style={styles.planPeriod}>{getPlanPeriod(product)}</Text>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => void restorePurchases()}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Subscription auto-renews unless cancelled at least 24 hours before
            the end of the current period. Manage or cancel anytime in your{' '}
            {storeLabel} account settings.
          </Text>
        </ScrollView>

        {isLoading ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.primary.purple} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
};

export default SubscriptionScreen;
