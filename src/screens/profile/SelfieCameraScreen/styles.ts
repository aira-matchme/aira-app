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
  backgroundGlow: {
    position: 'absolute',
    width: '100%',
    height: 600,
    alignSelf: 'center',
    top: '15%',
    opacity: 0.3,
  },
  headerContainer: {
  // Align back arrow with other profile screens
  paddingTop: 16,
  paddingHorizontal: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.medium,
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
    marginBottom: spacing.xl * 2,
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
    overflow: 'hidden',
  },
  camera: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    position: 'absolute',
    top: 0,
    left: 0,
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
    borderStyle: 'dashed',
  },
  // Overlay masks outside the circle
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  overlayLeft: {
    position: 'absolute',
    top: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    left: 0,
    width: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  overlayRight: {
    position: 'absolute',
    top: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    right: 0,
    width: (SCREEN_WIDTH - CIRCLE_SIZE) / 2,
    height: CIRCLE_SIZE,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 1.5,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
});

