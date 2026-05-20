import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH * 0.8, 300);
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.black,
  },
  safeArea: {
    flex: 1,
  },
  // Full-screen camera with dark overlay (Figma 814-3543)
  cameraFullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  headerContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
    paddingTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    
    color: colors.white,
    lineHeight: 36,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleFrame: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleBorder: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_RADIUS,
    borderWidth: 3,
    borderColor: colors.white,
  },
  // Overlay masks outside the circle
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  overlayLeft: {
    position: 'absolute',
    top: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    left: 0,
    width: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  overlayRight: {
    position: 'absolute',
    top: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    right: 0,
    width: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  // Tip box below circle (Figma)
  tipBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  tipBullet: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  // Circular capture button (Figma: white inner, dark outer ring)
  captureButtonContainer: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  captureButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  captureButtonSpinner: {
    position: 'absolute',
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
  // Verifying screen (Figma 886-3797)
  verifyingBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  // iOS-only helper to correct EXIF rotation for the blurred selfie background
  iosBackgroundRotate: {
    transform: [{ rotate: '90deg' }],
  },
  verifyingBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  verifyingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  verifyingSelfieCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_RADIUS,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.white,
  },
  verifyingSelfieImage: {
    width: '100%',
    height: '100%',
  },
  verifyingButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  verifyingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(80, 80, 80, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    gap: spacing.sm,
  },
  verifyingButtonText: {
    fontSize: 16,
    
    color: colors.white,
  },
  spinner: {
    marginBottom: spacing.xl,
  },
  verifyingTitle: {
    fontSize: 24,
    
    color: colors.white,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  verifyingSubtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.85,
  },
  // Verified success screen (Figma 886-3849)
  verifiedBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  verifiedBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  verifiedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  verifiedGreenCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_RADIUS,
    borderWidth: 4,
    borderColor: colors.semantic.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedCheckmarkWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.semantic.success,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: 100,
    gap: spacing.sm,
  },
  verifiedButtonText: {
    fontSize: 18,
    
    color: colors.white,
  },
  verifiedIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  verifiedTitle: {
    fontSize: 28,
    
    color: colors.white,
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  verifiedSubtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.85,
  },
});

