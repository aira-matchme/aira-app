import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
}) => {
  return (
    <LinearGradient
      colors={[
        '#7742F0', // top purple
        '#C671F4', // middle lavender
        '#F6F4EE', // bottom off-white
      ]}
      locations={[0, 0.45, 1]}
      start={{ x: 0.5, y: 0 }}   // top center
      end={{ x: 0.5, y: 1 }}     // bottom center
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
