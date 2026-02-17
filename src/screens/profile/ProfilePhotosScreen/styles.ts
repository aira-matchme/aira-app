import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_SIZE = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: spacing.xl,
  },
  photoCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.neutral[100],
    backgroundColor: colors.neutral[50],
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
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
