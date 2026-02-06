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
    flexDirection: 'column',
  },
  imageSection: {
    flex: 0.55,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  
  glow: {
    position: 'absolute',
    top: -140,
    width: 520,
    height: 520,
    borderRadius: 260,
    alignSelf: 'center',
  },
  
  onboardingImage: {
    width: '85%',
    height: '85%',
    zIndex: 2,
  },
  
  contentSection: {
    flex: 0.5, // 40% of screen
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  content: {
    alignItems: 'center',
    // paddingTop: spacing.lg,
  },
  title: {
    fontSize: 28,
    // fontFamily: typography.fontFamily.medium,
    fontWeight: '500',
    color: colors.black,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    maxWidth: '100%',
  },
  descriptionContainer: {
    width: '100%',
    maxWidth: 343,
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  description: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '400',
    color: colors.neutral[700],
    
    lineHeight: 20,
    letterSpacing: 0.28,
    textAlign: 'center',
  },
  timeEstimate: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '400',
    color: colors.neutral[700],
    lineHeight: 20,
    letterSpacing: 0.28,
    textAlign: 'left',
  },
  buttonContainer: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
  privacyNote: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '400',
    color: colors.neutral[700],
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.48,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

