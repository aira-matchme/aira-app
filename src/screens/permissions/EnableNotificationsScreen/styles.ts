import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

/**
 * Enable Notifications — Figma node 3312:14880 (375×812 reference).
 * https://www.figma.com/design/FzV81n1GwiDC68GJhKdPMv/AIRA?node-id=3312-14880
 */
export const FIGMA_ENABLE_NOTIFICATIONS = {
  FRAME_W: 375,
  STATUS_BAR_H: 48,
  /** Phone (LockScreen) top from frame top */
  PHONE_TOP: 87,
  /** First line of headline from frame top */
  TITLE_TOP: 520,
  /** Primary CTA top from frame top */
  PRIMARY_BUTTON_TOP: 662,
  HORIZONTAL_INSET: 16,
  CONTENT_W: 343,
  GAP_TITLE_SUBTITLE: 8,
  GAP_PRIMARY_SECONDARY: 8,
  PRIMARY_H: 54,
} as const;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F6F4EE',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orbLeft: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(119, 66, 240, 0.14)',
    top: -140,
    left: -160,
  },
  orbRight: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(203, 123, 245, 0.16)',
    top: -120,
    right: -140,
  },
  safeArea: {
    flex: 1,
  },
  /** Figma-composed column: mockup + absolutely placed copy and CTAs */
  figmaCanvas: {
    flex: 1,
    position: 'relative',
    width: '100%',
  },
  /** 87 − 48 = 39px below status bar (when status ≈ 48pt) */
  mockupPad: {
    paddingTop: FIGMA_ENABLE_NOTIFICATIONS.PHONE_TOP - FIGMA_ENABLE_NOTIFICATIONS.STATUS_BAR_H,
    alignItems: 'center',
    width: '100%',
  },
  absBlock: {
    position: 'absolute',
  },
  copyBlock: {
    gap: FIGMA_ENABLE_NOTIFICATIONS.GAP_TITLE_SUBTITLE,
    alignItems: 'center',
  },
  title: {
    ...typography.h2Semibold,
    color: colors.black,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  actions: {
    gap: FIGMA_ENABLE_NOTIFICATIONS.GAP_PRIMARY_SECONDARY,
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    height: FIGMA_ENABLE_NOTIFICATIONS.PRIMARY_H,
  },
  maybeLaterButton: {
    height: FIGMA_ENABLE_NOTIFICATIONS.PRIMARY_H,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  secondaryText: {
    ...typography.bodyMedium,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  permissionSheetContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '500',
    
    color: colors.text.dark,
    textAlign: 'center',
    lineHeight: 32,
  },
  permissionDescription: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButtons: {
    gap: spacing.sm,
    width: '100%',
  },
  allowButtonWrap: {
    width: '100%',
    maxWidth: 343,
    alignSelf: 'center',
  },
  dontAllowButton: {
    height: 54,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontAllowButtonText: {
    fontSize: 16,
    fontWeight: '500',
    
    color: colors.text.dark,
    letterSpacing: 0.32,
    lineHeight: 22,
  },
  bottomSafePad: {
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
  },
});
