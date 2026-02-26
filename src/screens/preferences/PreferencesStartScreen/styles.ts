import { StyleSheet, Dimensions } from 'react-native';
import { colors, typography } from '../../../theme';

// Figma 2101-9828: Preferences - Start screen (exact specs)
// Content block: left 16px, top 259.5px, width 343px. Button: bottom 258.5px, left 16px, w 343px.
const HORIZONTAL_PADDING = 16;
const CONTENT_WIDTH = 343; // 375 - 32
const CONTENT_TOP_OFFSET = 259.5; // from frame top in Figma
const HEADER_HEIGHT = 56; // back row: 4 + 48
const STATUS_BAR_HEIGHT = 48; // Figma frame
const CONTENT_PADDING_TOP = CONTENT_TOP_OFFSET - STATUS_BAR_HEIGHT - HEADER_HEIGHT; // 155.5
const BUTTON_BOTTOM_OFFSET = 258.5;
const GAP_ICON_TITLE = 24;
const GAP_TITLE_DESC = 8;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 4,
    paddingBottom: 0,
    height: HEADER_HEIGHT,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white, // Figma: base-colors/white
  },
  mainArea: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: CONTENT_PADDING_TOP,
    width: SCREEN_WIDTH,
    maxWidth: SCREEN_WIDTH,
  },
  contentBlock: {
    width: CONTENT_WIDTH,
    maxWidth: '100%',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary.purple, // violet_400 #7742f0
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: GAP_ICON_TITLE,
  },
  titleBlock: {
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    lineHeight: 36,
    letterSpacing: 0,
    marginBottom: GAP_TITLE_DESC,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.neutral[600], // #737373
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: BUTTON_BOTTOM_OFFSET,
    width: '100%',
    alignSelf: 'stretch',
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
});
