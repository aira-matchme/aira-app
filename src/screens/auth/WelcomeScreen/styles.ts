import { StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  statusBarContainer: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 17,
  },
  statusBarTime: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  statusBarIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 110,
    height: 50,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 39,
  },
  heading: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  termsText: {
    ...typography.small,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.text.primary,
    textDecorationLine: 'underline',
  },
});

