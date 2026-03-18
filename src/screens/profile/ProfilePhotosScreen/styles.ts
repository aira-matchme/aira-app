import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const HORIZONTAL_PADDING = 20;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: 280,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
  // Align back arrow with other profile screens
  paddingTop: 16,
  paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    lineHeight: 36,
    letterSpacing: 0,
    marginBottom: spacing.xl,
  },
  // Grid and photoCard are computed dynamically in component for 3-column layout
  photoImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletPoints: {
    gap: 8,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[800],
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  bottomContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 1.5,
    gap: spacing.md,
  },
  button: {
    width: '100%',
    height: 54,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary[50],
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: '#440FBD',
    lineHeight: 18,
    letterSpacing: 0.4,
  },
});
