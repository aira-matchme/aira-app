import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const CARD_SIZE = 145;
const CARD_RADIUS = 24;
const GRID_GAP = 14;
const HORIZONTAL_PADDING = 36;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
    alignSelf: 'center',
  },
  gridCell: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    minWidth: CARD_SIZE,
    minHeight: 180,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '110%',
  },
  textBlock: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: 12,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
  },
  title: {
    ...typography.h2,
    color: colors.black,
    textAlign: 'center',
    maxWidth: 263,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  primaryButton: {
    height: 54,
    borderRadius: 100,
    width: 343,
    alignSelf: 'center',
  },
});
