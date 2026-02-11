import { StyleSheet, Platform } from 'react-native';
import { colors, spacing } from '../../../theme';

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
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.neutral[700],
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  bottomGradient: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '40%',
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  zIndex: 10,
},
  actions: {
    width: '100%',
    paddingHorizontal: spacing.md,
    // paddingBottom: spacing.lg,
    paddingTop: spacing.xxl,
    zIndex: 20,
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
