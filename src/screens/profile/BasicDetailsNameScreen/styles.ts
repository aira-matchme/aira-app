import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
    // overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: 280,
  },
  middleGradient: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height:480,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  /** Fills space under header; scrolls when keyboard shrinks viewport so CTA stays reachable */
  mainScroll: {
    flex: 1,
    minHeight: 0,
  },
  mainScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 40, // 👈 ADD THIS
  },
  formSection: {
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    lineHeight: 44,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    lineHeight: 22,
    letterSpacing: 0.32,
  },
  inputWrapper: {
    marginTop: spacing.xl * 2,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 343,
    marginBottom: spacing.sm,
  },
  inputWrapperWithError: {
    marginBottom: spacing.xl,
  },
  inputGradient: {
    padding: 1,
    borderRadius: 26,
  },
  input: {
    height: 54,
    paddingHorizontal: 20,
    fontSize: 16,
    borderRadius: 100,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.02,
    shadowRadius: 28,
    elevation: 1,
  },
  buttonContainer: {
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  button: {
    height: 54,
    borderRadius: 100,
  },
});

