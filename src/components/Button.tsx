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
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const HEIGHT = 54;
const RADIUS = 100;
const SIDE_SLOT = 24;
/** Figma primary CTA: 2px stroke, white @ 20% (inner-aligned) */
const PRIMARY_BORDER_WIDTH = 2;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  success = false,
  successIcon,
  leftIcon,
  rightIcon,
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

    // Figma 213:849 — disabled / loading: neutral/50 fill, neutral/300 label, no gradient
    if (isDisabled) {
      return (
        <Pressable
          disabled
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.wrapper, styles.primaryDisabled, style]}
        >
          <View style={styles.contentRow}>
            <View style={styles.sideSlot} pointerEvents="none">
              {loading ? (
                <ActivityIndicator size="small" color={colors.neutral[300]} />
              ) : (
                leftIcon ?? null
              )}
            </View>
            <Text style={[styles.primaryDisabledText, textStyle]}>{title}</Text>
            <View style={styles.sideSlot} pointerEvents="none">
              {loading ? null : rightIcon ?? null}
            </View>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        disabled={false}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={({ pressed }) => [styles.wrapper, pressed && styles.pressed, style]}
      >
        <LinearGradient
          colors={[...colors.gradients.primary.colors]}
          start={colors.gradients.primary.start}
          end={colors.gradients.primary.end}
          style={styles.gradient}
        >
          <LinearGradient
            colors={[...colors.gradients.primaryButtonSheen.colors]}
            locations={[...colors.gradients.primaryButtonSheen.locations]}
            start={colors.gradients.primaryButtonSheen.start}
            end={colors.gradients.primaryButtonSheen.end}
            style={styles.sheen}
            pointerEvents="none"
          />
          <View style={styles.contentRow}>
            <View style={styles.sideSlot} pointerEvents="none">
              {leftIcon ?? null}
            </View>
            <Text style={[styles.text, textStyle]}>{title}</Text>
            <View style={styles.sideSlot} pointerEvents="none">
              {rightIcon ?? null}
            </View>
          </View>
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
        isDisabled && styles.secondaryDisabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isDisabled ? styles.secondaryDisabledText : styles.secondaryText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: HEIGHT,
    borderRadius: RADIUS,
    borderWidth: PRIMARY_BORDER_WIDTH,
    borderColor: colors.border.primaryButton,
    overflow: 'hidden',
  },

  gradient: {
    flex: 1,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  sheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
  },

  contentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  sideSlot: {
    width: SIDE_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
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

  /** Figma component set — disabled (213:849) */
  primaryDisabled: {
    backgroundColor: colors.neutral[50],
    borderWidth: 0,
    justifyContent: 'center',
  },

  primaryDisabledText: {
    ...typography.button,
    color: colors.neutral[300],
  },

  secondaryDisabled: {
    backgroundColor: colors.neutral[50],
  },

  secondaryDisabledText: {
    color: colors.neutral[300],
  },

  pressed: {
    opacity: 0.85,
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

});
