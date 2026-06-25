import React, { useMemo } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  WAITLIST_BOTTOM_GRADIENT_ASPECT,
  scaleWaitlistByHeight,
} from '../layout';

const BORDER_GLOW = require('../../../assets/images/waitlist/border-glow.png');
const BOTTOM_GRADIENT = require('../../../assets/images/waitlist/bottom-gradient.png');

/**
 * Figma waitlist background layers (node 3697:14301):
 * 1. Black base + edge vignette image (inset glow frame) — full screen
 * 2. Bottom purple gradient (Rectangle 40, node 3697:14302) — overlaid at bottom
 */
export const WaitlistBackground: React.FC = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const bottomGradientHeight = useMemo(() => {
    const aspectHeight = Math.round(windowWidth * WAITLIST_BOTTOM_GRADIENT_ASPECT);
    const figmaHeight = scaleWaitlistByHeight(windowHeight, 188);
    return Math.max(aspectHeight, figmaHeight);
  }, [windowWidth, windowHeight]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        source={BORDER_GLOW}
        style={styles.edgeGlow}
        resizeMode="stretch"
        accessibilityIgnoresInvertColors
      />

      <Image
        source={BOTTOM_GRADIENT}
        style={[styles.bottomGradient, { height: bottomGradientHeight }]}
        resizeMode="stretch"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  edgeGlow: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
});
