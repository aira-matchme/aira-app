import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

interface RadialTopGlowProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const RadialTopGlow: React.FC<RadialTopGlowProps> = ({
  children,
  style,
}) => {
  const gradientId = `topGlow_${Math.random()}`;

  return (
<View style={styles.container}>
  <View style={styles.glowWrapper}>
    <Svg width="100%" height="100%">
      <Defs>
        <RadialGradient
          id="topGlow"
          cx="50%"
          cy="0%"
          fx="50%"
          fy="0%"
          rx="250%"
          ry="250%"
        >
          <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.25" />
          <Stop offset="50%" stopColor="#C87BF5" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#C87BF5" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect width="100%" height="100%" fill="url(#topGlow)" />
    </Svg>
  </View>

  {children}
</View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  glowWrapper: {
    position: 'absolute',
    top: 0,
    // alignSelf: 'start',
    width: '60%',   // 👈 60% width
    height: '40%',  // 👈 40% height
  },
});

export default RadialTopGlow;