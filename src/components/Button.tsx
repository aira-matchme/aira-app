import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
  successIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const HEIGHT = 54;
const RADIUS = 100;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  success = false,
  successIcon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading || success;

  /**
   * ======================
   * PRIMARY VARIANT
   * ======================
   */
  if (variant === 'primary') {
    // ✅ SUCCESS STATE
    if (success) {
      return (
        <View style={[styles.wrapper, style]}>
          <View style={styles.successButton}>
            {successIcon}
            <Text style={[styles.text, styles.successText, textStyle]}>
              {title}
            </Text>
          </View>
        </View>
      );
    }

    // ⏳ LOADING STATE
    if (loading) {
      return (
        <Pressable style={[styles.wrapper, style]} disabled>
          <LinearGradient
            colors={[colors.secondary.lavender, colors.primary.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.88, y: 1 }}
            style={styles.gradientLoading}
          >
            <ActivityIndicator size="small" color={colors.white} />
            <Text style={[styles.text, styles.loadingText, textStyle]}>
              {title}
            </Text>
          </LinearGradient>
        </Pressable>
      );
    }

    // 🔥 NORMAL PRIMARY
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={({ pressed }) => [
          styles.wrapper,
          pressed && styles.pressed,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.secondary.lavender, colors.primary.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.88, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  /**
   * ======================
   * SECONDARY VARIANT
   * ======================
   */
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => [
        styles.secondary,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, styles.secondaryText, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: HEIGHT,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  gradient: {
    flex: 1,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // ✅ safe clipping
  },

  gradientLoading: {
    flex: 1,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },

  text: {
    ...typography.button,
    color: colors.text.primary,
  },

  secondary: {
    height: HEIGHT,
    borderRadius: RADIUS,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    color: colors.primary.purple,
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.5,
  },

  successButton: {
    height: HEIGHT,
    borderRadius: RADIUS,
    backgroundColor: colors.semantic.success,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  successText: {
    color: colors.white,
  },

  loadingText: {
    color: colors.white,
    marginLeft: spacing.sm,
  },
});
