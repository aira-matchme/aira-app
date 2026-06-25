import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { STRINGS } from '../../../constants/strings';
import { colors, typography } from '../../../theme';
import {
  WAITLIST_PREMIUM_CARD_HEIGHT,
  scaleWaitlist,
} from '../layout';
import { WaitlistPremiumInsetGlow } from './WaitlistPremiumInsetGlow';
import { WaitlistPremiumSparkleIcon } from './WaitlistPremiumSparkleIcon';

/** Figma Frame 827 — node 3697:14308 */
export const WaitlistPremiumCard: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();

  const cardHeight = useMemo(
    () => scaleWaitlist(windowWidth, WAITLIST_PREMIUM_CARD_HEIGHT),
    [windowWidth],
  );

  return (
    <View style={[styles.cardOuter, { height: cardHeight, borderRadius: 32 }]}>
      <View style={styles.cardSurface} pointerEvents="none">
        <WaitlistPremiumInsetGlow
          height={cardHeight}
          windowWidth={windowWidth}
        />
      </View>

      <View style={styles.cardContent}>
        <WaitlistPremiumSparkleIcon />
        <View style={styles.textColumn}>
          <Text style={styles.title}>{STRINGS.WAITLIST.PREMIUM_TITLE}</Text>
          <Text style={styles.descriptionLine}>
            {STRINGS.WAITLIST.PREMIUM_DESCRIPTION_LINE_1}
          </Text>
          <Text style={styles.descriptionLine}>
            {STRINGS.WAITLIST.PREMIUM_DESCRIPTION_LINE_2}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
  cardSurface: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.8,
    color: colors.primary.purple,
  },
  descriptionLine: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.6,
    color: colors.neutral[500],
  },
});
