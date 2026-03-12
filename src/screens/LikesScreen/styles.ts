import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, typography } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Figma 1584-8790 specs
export const H_PADDING = 16;
export const GRID_GAP = 16;
export const CARD_HEIGHT = 200;
export const CARD_RADIUS = 20;
export const OVERLAY_HEIGHT = 72;

export const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GRID_GAP) / 2;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  screenFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[50],
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: 280,
  },
  topGlow: {
    position: 'absolute',
    left: 0,
    top: -59,
    width: 213,
    height: 213,
    pointerEvents: 'none',
  },
  safe: {
    flex: 1,
    paddingHorizontal: H_PADDING,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8, // Figma: gap from top safe area to header
  },
  title: {
    ...typography.h3,
    fontWeight: '500',
    color: colors.black,
    letterSpacing: -0.24,
  },
  notifButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.07,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 260,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.neutral[600],
  },

  list: {
    flex: 1,
    marginTop: 18,
  },
  row: {
    marginBottom: GRID_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
  },
  cardLeft: {
    marginRight: GRID_GAP,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: OVERLAY_HEIGHT,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'flex-end',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.white,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  distance: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.44,
    color: colors.neutral[200],
  },
  contentPaddingBottom: {
    paddingBottom: 0, // keep cards partially under floating tab bar like Figma
  },
});

