import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, typography } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Figma 1640-9551: Messages / Chat list
export const H_PADDING = 16;
export const CARD_RADIUS = 16;
export const AVATAR_SIZE = 56;
export const CARD_VERTICAL_PADDING = 12;
export const CARD_HORIZONTAL_PADDING = 16;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  screenFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[50],
  },
  safe: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  title: {
    ...typography.h3,
    fontWeight: '600',
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
  list: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.white,
    paddingVertical: CARD_VERTICAL_PADDING,
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 280,
  },
  cardPinned: {
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  // Figma 1690-8757: long-press context menu
  contextMenuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contextMenu: {
    position: 'absolute',
    right: H_PADDING,
    top: 220,
    backgroundColor: colors.white,
    borderRadius: 12,
    minWidth: 160,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  contextMenuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  contextMenuLabelDanger: {
    color: colors.semantic.error,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.neutral[200],
  },
  body: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginRight: 6,
  },
  unreadBadge: {
    backgroundColor: colors.primary.purple,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
    marginRight: 8,
  },
  previewDraft: {
    color: colors.primary.purple,
  },
  previewMuted: {
    color: colors.neutral[400],
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[500],
    marginBottom: 4,
  },
  pinnedIconWrap: {
    marginTop: 2,
  },
});
