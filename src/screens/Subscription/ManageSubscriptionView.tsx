import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { IapEntitlement } from '../../modules/iap/types';
import {
  buildRenewalBannerText,
  formatProductLabel,
  formatRelativeRenewal,
  formatSubscriptionAmountGBP,
  formatSubscriptionDate,
  getPlanStatusLabel,
} from '../../modules/iap/entitlements';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import { SUPPORT_EMAIL_URL } from './cancelSubscription';
import { PlusPlanGradientCard } from './components/PlusPlanGradientCard';
import {
  PlanAmountIcon,
  PlanRenewIcon,
  PlanStatusIcon,
  PlanTypeIcon,
  RenewalInfoIcon,
} from './components/PlanDetailIcons';
import {
  SubscriptionPlusFeaturesList,
  SubscriptionPlusLogoRow,
} from './components/SubscriptionPlusFeatures';
import { SubscriptionScreenHeader } from './components/SubscriptionScreenHeader';
import { manageStyles as styles } from './manageStyles';

type ManageSubscriptionViewProps = {
  entitlement: IapEntitlement | null;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  displayPrice?: string;
};

type DetailRowProps = {
  label: string;
  value: string;
  subValue?: string | null;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  subValue,
  icon,
  trailing,
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      <View style={styles.detailIconWrap}>{icon}</View>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    {trailing ?? (
      <View style={subValue ? styles.detailValueColumn : undefined}>
        <Text style={styles.detailValue}>{value}</Text>
        {subValue ? <Text style={styles.detailSubValue}>{subValue}</Text> : null}
      </View>
    )}
  </View>
);

export const ManageSubscriptionView: React.FC<ManageSubscriptionViewProps> = ({
  entitlement,
  hasActiveSubscription,
  isLoading,
  displayPrice,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const insets = useSafeAreaInsets();

  const amountLabel = useMemo(
    () => formatSubscriptionAmountGBP(displayPrice, { perMonth: true }),
    [displayPrice],
  );
  const renewalAmountLabel = useMemo(
    () => formatSubscriptionAmountGBP(displayPrice),
    [displayPrice],
  );
  const planLabel = formatProductLabel(entitlement?.productId);
  const renewDate = formatSubscriptionDate(entitlement?.currentPeriodEnd);
  const relativeRenewal = formatRelativeRenewal(entitlement?.currentPeriodEnd);
  const status = getPlanStatusLabel(entitlement, hasActiveSubscription);
  const renewalBanner = buildRenewalBannerText(
    entitlement,
    hasActiveSubscription,
    renewalAmountLabel,
  );

  const handleContact = useCallback(() => {
    void Linking.openURL(SUPPORT_EMAIL_URL);
  }, []);

  const handleCancel = useCallback(() => {
    navigation.navigate('CancelSubscriptionReason');
  }, [navigation]);

  const statusBadgeStyle =
    status.tone === 'active'
      ? styles.statusBadgeActive
      : status.tone === 'cancelled'
        ? styles.statusBadgeCancelled
        : styles.statusBadgeEnded;

  const statusTextStyle =
    status.tone === 'active'
      ? styles.statusTextActive
      : status.tone === 'cancelled'
        ? styles.statusTextCancelled
        : styles.statusTextEnded;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <SubscriptionScreenHeader onBack={() => navigation.goBack()} />

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary.purple} />
            <Text style={styles.loadingText}>Loading subscription...</Text>
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: 24 },
              ]}
            >
              <PlusPlanGradientCard style={styles.heroCard}>
                <SubscriptionPlusLogoRow />
                <SubscriptionPlusFeaturesList />
              </PlusPlanGradientCard>

              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Plan Details</Text>
                <View style={styles.divider} />
                <View style={styles.detailRows}>
                  <DetailRow
                    label="Status"
                    value={status.label}
                    icon={<PlanStatusIcon />}
                    trailing={
                      <View style={[styles.statusBadge, statusBadgeStyle]}>
                        <Text style={[styles.statusBadgeText, statusTextStyle]}>
                          {status.label}
                        </Text>
                      </View>
                    }
                  />
                  <DetailRow
                    label="Plan"
                    value={planLabel}
                    icon={<PlanTypeIcon />}
                  />
                  <DetailRow
                    label="Renews"
                    value={renewDate}
                    subValue={hasActiveSubscription ? relativeRenewal : null}
                    icon={<PlanRenewIcon />}
                  />
                  <DetailRow
                    label="Amount"
                    value={amountLabel}
                    icon={<PlanAmountIcon />}
                  />
                </View>
              </View>

              <View style={styles.renewalBanner}>
                <View style={styles.renewalIconWrap}>
                  <RenewalInfoIcon />
                </View>
                <Text style={styles.renewalText}>{renewalBanner}</Text>
              </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              {hasActiveSubscription &&
              entitlement?.autoRenewEnabled !== false &&
              !entitlement?.cancelledAt ? (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.9}
                >
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.helpRow}>
                <Text style={styles.helpMuted}>Need Help?</Text>
                <TouchableOpacity onPress={handleContact} activeOpacity={0.7}>
                  <Text style={styles.helpLink}>Contact Us</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
};
