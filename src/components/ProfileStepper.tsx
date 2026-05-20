import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ProfileStepperProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}

export const ProfileStepper: React.FC<ProfileStepperProps> = ({
  currentStep,
  totalSteps,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const completed = step < currentStep;

          return (
            <View
              key={step}
              style={[
                styles.dot,
                active && styles.dotActive,
                completed && styles.dotCompleted,
              ]}
            />
          );
        })}

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {currentStep}/{totalSteps}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
    opacity: 0.6,
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.black,
    opacity: 1,
  },
  dotCompleted: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[300],
    opacity: 0.6,
  },
  badge: {
    marginLeft: 8,
    borderWidth: 0.5,
    borderColor: colors.black,
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    
    letterSpacing: 0.8,
    color: colors.black,
  },
});


