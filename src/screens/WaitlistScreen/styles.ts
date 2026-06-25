import { StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';
import {
  WAITLIST_HORIZONTAL_PADDING,
  WAITLIST_INFO_CARD_HEIGHT,
} from './layout';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: WAITLIST_HORIZONTAL_PADDING,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 32,
  },
  heroBlock: {
    width: '100%',
    maxWidth: 305,
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  titleLine: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -1.28,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.84,
    color: colors.neutral[400],
    textAlign: 'center',
    maxWidth: 257,
  },
  cardsBlock: {
    width: '100%',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    minHeight: WAITLIST_INFO_CARD_HEIGHT,
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  infoCardInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(119, 66, 240, 0.5)',
  },
  infoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  infoTitleLine: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: -0.8,
    color: colors.white,
    textAlign: 'center',
  },
  infoDescriptionLine: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.6,
    color: colors.neutral[300],
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: WAITLIST_HORIZONTAL_PADDING,
    paddingTop: 8,
    gap: 8,
    width: '100%',
  },
  primaryButton: {
    height: 54,
    borderRadius: 100,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.black,
  },
  secondaryButton: {
    height: 54,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.white,
    textAlign: 'center',
  },
});
