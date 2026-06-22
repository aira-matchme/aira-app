import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SUBSCRIPTION_BASE_COLOR } from '../layout';
import { MANAGE_HERO_HEIGHT, MANAGE_HERO_RADIUS } from '../manageLayout';

/** Full card gradient from Figma node 4141:6935 (user-provided export). */
const CARD_GRADIENT = require('../../../assets/images/subscription/plus-card-gradient.jpg');

type PlusPlanGradientCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  height?: number;
};

/** Figma 4215:16285 — violet hero card with mesh gradient background. */
export const PlusPlanGradientCard: React.FC<PlusPlanGradientCardProps> = ({
  children,
  style,
  height,
}) => (
  <View style={[styles.card, height != null ? { height } : null, style]}>
    <View style={styles.base} />
    <Image source={CARD_GRADIENT} style={styles.gradient} resizeMode="cover" />
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: MANAGE_HERO_RADIUS,
    overflow: 'hidden',
    backgroundColor: SUBSCRIPTION_BASE_COLOR,
    minHeight: MANAGE_HERO_HEIGHT,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SUBSCRIPTION_BASE_COLOR,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
