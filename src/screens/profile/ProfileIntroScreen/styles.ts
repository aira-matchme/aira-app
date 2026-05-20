import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
    width: '100%',
  },
  headerCard: {
    width: '100%',
    height: '60%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    color: colors.neutral[600],
    lineHeight: 22,
    letterSpacing: 0.32,
    paddingHorizontal: spacing.sm,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 400,
    height: 400,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  actions: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 100,
    backgroundColor: colors.white,
  },
  primaryButtonText: {
    color: colors.primary.purple,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.32,
  },
});
