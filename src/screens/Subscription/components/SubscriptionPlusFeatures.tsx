import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

import { LogoWordmark } from '../../../assets/icons/branding/LogoWordmark';
import { colors, typography } from '../../../theme';
import {
  SUBSCRIPTION_FEATURE_ICON_BORDER,
  SUBSCRIPTION_FEATURE_ICON_RADIUS,
  SUBSCRIPTION_FEATURE_ICON_SIZE,
  SUBSCRIPTION_FEATURE_ROW_GAP,
  SUBSCRIPTION_FEATURE_TEXT_GAP,
  SUBSCRIPTION_FEATURES_GAP,
  SUBSCRIPTION_GRADIENT_END,
  SUBSCRIPTION_GRADIENT_START,
  SUBSCRIPTION_LOGO_HEIGHT,
  SUBSCRIPTION_LOGO_ROW_GAP,
  SUBSCRIPTION_LOGO_WIDTH,
  SUBSCRIPTION_PLUS_INNER_GAP,
  SUBSCRIPTION_PLUS_PAD_LEFT,
  SUBSCRIPTION_PLUS_PAD_RIGHT,
  SUBSCRIPTION_PLUS_PAD_V,
  scaleSubscription,
} from '../layout';
import { PlusGemIcon } from './PlusGemIcon';
import {
  AIAssistFeatureIcon,
  InsightsFeatureIcon,
  IntroductionsFeatureIcon,
  MessagingFeatureIcon,
} from './SubscriptionFeatureIcons';

const FEATURES = [
  {
    key: 'introductions',
    Icon: IntroductionsFeatureIcon,
    title: 'Aira Introductions',
    description: 'Aira introduces you, so the conversation starts warm, not cold.',
  },
  {
    key: 'messaging',
    Icon: MessagingFeatureIcon,
    title: 'Unlimited Messaging',
    description: 'No limits mid-conversation. Just talk.',
  },
  {
    key: 'ai',
    Icon: AIAssistFeatureIcon,
    title: 'In-Chat AI Assistance',
    description: 'Stuck on what to say? Aira suggests replies that actually sound like you.',
  },
  {
    key: 'insights',
    Icon: InsightsFeatureIcon,
    title: 'Profile Match Insights',
    description: 'Compatibility scores, shared traits, and ready-made conversation starters.',
  },
] as const;

export const SubscriptionPlusLogoRow: React.FC = () => {
  const { width } = useWindowDimensions();
  const scale = (value: number) => scaleSubscription(value, width);

  return (
    <View style={styles.logoRow}>
      <LogoWordmark width={scale(SUBSCRIPTION_LOGO_WIDTH)} height={scale(SUBSCRIPTION_LOGO_HEIGHT)} />
      <View style={styles.plusBadge}>
        <MaskedView maskElement={<Text style={styles.plusText}>plus</Text>}>
          <LinearGradient
            colors={[SUBSCRIPTION_GRADIENT_START, SUBSCRIPTION_GRADIENT_END]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <Text style={[styles.plusText, styles.plusTextHidden]}>plus</Text>
          </LinearGradient>
        </MaskedView>
        <PlusGemIcon size={scale(26)} />
      </View>
    </View>
  );
};

export const SubscriptionPlusFeaturesList: React.FC = () => (
  <View style={styles.list}>
    {FEATURES.map((feature) => (
      <View key={feature.key} style={styles.row}>
        <View style={styles.iconWrap}>
          <feature.Icon />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{feature.title}</Text>
          <Text style={styles.description}>{feature.description}</Text>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SUBSCRIPTION_LOGO_ROW_GAP,
    marginBottom: 32,
  },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SUBSCRIPTION_PLUS_INNER_GAP,
    backgroundColor: colors.white,
    paddingLeft: SUBSCRIPTION_PLUS_PAD_LEFT,
    paddingRight: SUBSCRIPTION_PLUS_PAD_RIGHT,
    paddingVertical: SUBSCRIPTION_PLUS_PAD_V,
    borderRadius: 100,
  },
  plusText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
    lineHeight: 22,
    letterSpacing: -0.32,
  },
  plusTextHidden: { opacity: 0 },
  list: { gap: SUBSCRIPTION_FEATURES_GAP },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SUBSCRIPTION_FEATURE_ROW_GAP,
  },
  iconWrap: {
    width: SUBSCRIPTION_FEATURE_ICON_SIZE,
    height: SUBSCRIPTION_FEATURE_ICON_SIZE,
    borderRadius: SUBSCRIPTION_FEATURE_ICON_RADIUS,
    borderWidth: SUBSCRIPTION_FEATURE_ICON_BORDER,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1, gap: SUBSCRIPTION_FEATURE_TEXT_GAP },
  title: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
  },
  description: {
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0.28,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[300],
  },
});
