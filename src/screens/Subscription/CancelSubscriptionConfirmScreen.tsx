import React, { useCallback, useState } from 'react';
import {
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { getStoreManageSubscriptionsUrl } from '../../modules/iap/entitlements';
import type { ProfileStackParamList } from '../../navigation/types';
import { useSubscriptionStore } from '../../store/subscription.store';
import { colors, typography } from '../../theme';
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
  const insets = useSafeAreaInsets();
  const entitlement = useSubscriptionStore((s) => s.entitlements[0] ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleStay = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const handleOpenRetention = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const handleCancelAnyway = useCallback(async () => {
    setSheetOpen(false);
    const platform = entitlement?.platform ?? (Platform.OS === 'ios' ? 'apple' : 'google');
    const url = getStoreManageSubscriptionsUrl(platform);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
    navigation.popToTop();
  }, [entitlement?.platform, navigation]);

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
          >
            <Text style={styles.secondaryButtonText}>I still want to cancel</Text>
          </TouchableOpacity>
        </View>

        <CancelSubscriptionRetentionSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onStay={() => setSheetOpen(false)}
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
