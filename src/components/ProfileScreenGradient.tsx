import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const GRADIENT_ID = 'profileScreenGradient';

/**
 * Reusable top-left purple radial gradient used across profile module screens.
 * Matches the gradient from BasicDetailsMaritalStatusScreen.
 */
export const ProfileScreenGradient: React.FC = () => (
  <View style={styles.backgroundGlow}>
    <Svg height="100%" width="100%" style={styles.svg}>
      <Defs>
        <RadialGradient
          id={GRADIENT_ID}
          cx="0%"
          cy="0%"
          rx="120%"
          ry="120%"
          fx="0%"
          fy="0%"
        >
          <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.4" />
          <Stop offset="70%" stopColor="#C87BF5" stopOpacity="0.06" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 320,
  },
  svg: {
    position: 'absolute',
  },
});
