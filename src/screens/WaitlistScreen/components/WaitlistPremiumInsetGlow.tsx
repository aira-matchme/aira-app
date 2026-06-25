import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scaleWaitlist } from '../layout';

const CARD_RADIUS = 32;

type Props = {
  height: number;
  windowWidth: number;
};

/**
 * Figma Frame 827 — inset 0 0 15px #7742F0
 * Soft edge fade clipped by parent borderRadius (no stroke ring, no oval fill).
 */
export const WaitlistPremiumInsetGlow: React.FC<Props> = ({
  height,
  windowWidth,
}) => {
  const blur = useMemo(() => scaleWaitlist(windowWidth, 15), [windowWidth]);

  const edge = 'rgba(119, 66, 240, 0.22)';
  const mid = 'rgba(119, 66, 240, 0.07)';
  const clear = 'rgba(119, 66, 240, 0)';

  const stops = [edge, mid, clear] as const;
  const locations = [0, 0.42, 1] as const;

  return (
    <View style={styles.root} pointerEvents="none">
      <LinearGradient
        colors={[...stops]}
        locations={[...locations]}
        style={[styles.edge, { height: blur }]}
      />
      <LinearGradient
        colors={[...stops].reverse()}
        locations={[...locations]}
        style={[styles.edge, { bottom: 0, top: undefined, height: blur }]}
      />
      <LinearGradient
        colors={[...stops]}
        locations={[...locations]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, { width: blur, height }]}
      />
      <LinearGradient
        colors={[...stops].reverse()}
        locations={[...locations]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.edge, { right: 0, left: undefined, width: blur, height }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  edge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
