import React from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

import { SUBSCRIPTION_BASE_COLOR, SUBSCRIPTION_FIGMA_HEIGHT } from './layout';

/** Full mesh background exported from Figma (user-provided). */
const BACKGROUND = require('../../assets/images/subscription/background.jpg');

/** Figma status bar height — crop baked-in status bar from the export. */
const FIGMA_STATUS_BAR_HEIGHT = 48;

/**
 * Figma background for node 4285:14401.
 * Uses a single full-bleed image (cover) instead of stretched layer PNGs.
 */
export const SubscriptionBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const statusBarCrop = (FIGMA_STATUS_BAR_HEIGHT / SUBSCRIPTION_FIGMA_HEIGHT) * height;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.base, { backgroundColor: SUBSCRIPTION_BASE_COLOR }]} />
      <Image
        source={BACKGROUND}
        style={{
          position: 'absolute',
          top: -statusBarCrop,
          left: 0,
          width,
          height: height + statusBarCrop,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
  },
});
