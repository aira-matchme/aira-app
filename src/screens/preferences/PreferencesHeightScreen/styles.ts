import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '500',
    lineHeight: 44,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.neutral[600],
    marginBottom: spacing.xl,
  },
  sliderContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
  actions: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl * 2 : spacing.xl,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
});
