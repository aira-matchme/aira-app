import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const HORIZONTAL_PADDING = 16;
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP * 2) / 3;
const CARD_HEIGHT = 120;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  safeArea: {
    flex: 1,
    
  },
  headerContainer: {
    paddingTop: spacing.md,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,

    paddingTop: 16,
    marginBottom: 14,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    lineHeight: 32,
    letterSpacing: -0.24,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 20,
    letterSpacing: 0.28,
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  progressBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary.purple,
    letterSpacing: 0.32,
  },
  progressTrack: {
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.neutral[200],
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
    width: '75%',
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: 32,
    width: SCREEN_WIDTH - HORIZONTAL_PADDING * 2,
  },
  photoCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  photoCardFilled: {
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    lineHeight: 20,
    letterSpacing: 0.28,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    lineHeight: 22,
    letterSpacing: 0.32,
  },
  detailLeft: {
    flex: 1,
    marginRight: 12,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
});

export const CARD_WIDTH_PX = CARD_WIDTH;
export const CARD_HEIGHT_PX = CARD_HEIGHT;
