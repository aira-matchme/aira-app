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
  scrollView: {
    flex: 1,
    minHeight: 0,
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
    
    color: colors.black,
    lineHeight: 36,
    letterSpacing: 0,
    marginBottom: spacing.xl,
  },
  photoGrid: {
    width: '100%',
    marginBottom: 24,
    flexDirection: 'column',
    gap: 12,
  },
  photoGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoCard: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 0,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
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
    paddingBottom: spacing.sm,
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
