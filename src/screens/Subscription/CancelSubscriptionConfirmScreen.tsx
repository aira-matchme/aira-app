import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { Button } from '../../components/Button';
import {
  getIapEntitlementsApi,
  postCancelSubscriptionRequestApi,
} from '../../modules/iap/api';
import { getStoreManageSubscriptionsUrl, normalizeEntitlements } from '../../modules/iap/entitlements';
import type { ProfileStackParamList } from '../../navigation/types';
import { useSubscriptionStore } from '../../store/subscription.store';
import { colors, typography } from '../../theme';
import { resolveUserFacingError } from '../../utils/resolveUserFacingError';
import { buildCancelSubscriptionApiReason } from './cancelSubscription';
import { PlusPlanGradientCard } from './components/PlusPlanGradientCard';
import {
  SubscriptionPlusFeaturesList,
  SubscriptionPlusLogoRow,
} from './components/SubscriptionPlusFeatures';
import { CancelSubscriptionRetentionSheet } from './components/CancelSubscriptionRetentionSheet';
import { SubscriptionScreenHeader } from './components/SubscriptionScreenHeader';
import { MANAGE_FOOTER_BUTTON_HEIGHT, MANAGE_HERO_HEIGHT, MANAGE_SCREEN_PAD_H } from './manageLayout';

export const CancelSubscriptionConfirmScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'CancelSubscriptionConfirm'>>();
  const insets = useSafeAreaInsets();
  const entitlement = useSubscriptionStore((s) => s.entitlements[0] ?? null);
  const setEntitlements = useSubscriptionStore((s) => s.setEntitlements);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const { reason, otherReason } = route.params;

  const handleStay = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const handleOpenRetention = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const handleCancelAnyway = useCallback(async () => {
    if (isSubmittingCancel) return;

    const reasonPayload = buildCancelSubscriptionApiReason(reason, otherReason);
    if (!reasonPayload) {
      Alert.alert('Reason required', 'Please go back and select a cancellation reason.');
      return;
    }

    setIsSubmittingCancel(true);
    setSheetOpen(false);

    try {
      await postCancelSubscriptionRequestApi({ reason: reasonPayload });

      try {
        const entitlementsResponse = await getIapEntitlementsApi();
        setEntitlements(normalizeEntitlements(entitlementsResponse));
      } catch {
        // Store redirect can still proceed if entitlements refresh fails.
      }

      const platform = entitlement?.platform ?? (Platform.OS === 'ios' ? 'apple' : 'google');
      const url = getStoreManageSubscriptionsUrl(platform);
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }

      navigation.popToTop();
    } catch (error) {
      Alert.alert(
        'Unable to continue',
        resolveUserFacingError(error, 'subscription'),
        [{ text: 'OK' }],
      );
    } finally {
      setIsSubmittingCancel(false);
    }
  }, [
    entitlement?.platform,
    isSubmittingCancel,
    navigation,
    otherReason,
    reason,
    setEntitlements,
  ]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <SubscriptionScreenHeader
          title="Cancel Subscription"
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Are you sure you want to cancel your subscription? You will lose access
            to all these features.
          </Text>

          <PlusPlanGradientCard style={styles.heroCard}>
            <SubscriptionPlusLogoRow />
            <SubscriptionPlusFeaturesList />
          </PlusPlanGradientCard>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button
            title="I changed my mind, take me back!"
            onPress={handleStay}
            variant="primary"
            centerTitleOnly
            style={styles.primaryButton}
          />

          <TouchableOpacity
            onPress={handleOpenRetention}
            activeOpacity={0.85}
            style={styles.secondaryButton}
            disabled={isSubmittingCancel}
          >
            <Text style={styles.secondaryButtonText}>I still want to cancel</Text>
          </TouchableOpacity>
        </View>

        <CancelSubscriptionRetentionSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onStay={() => setSheetOpen(false)}
          isCancelling={isSubmittingCancel}
          onCancelAnyway={() => void handleCancelAnyway()}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: MANAGE_SCREEN_PAD_H,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
  },
  heroCard: {
    height: MANAGE_HERO_HEIGHT,
  },
  footer: {
    paddingHorizontal: MANAGE_SCREEN_PAD_H,
    paddingTop: 8,
    gap: 8,
    backgroundColor: colors.white,
  },
  primaryButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
  secondaryButton: {
    minHeight: MANAGE_FOOTER_BUTTON_HEIGHT,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    textAlign: 'center',
  },
});
