/**
 * Reusable API error modal (Figma: Something went wrong).
 * - Shows title, message, and an OK button (no Retry).
 * - OK or backdrop/drag closes the modal.
 * - Auto-closes after 5 seconds.
 *
 * Use globally: useApiErrorStore.getState().showError(message) from anywhere
 * (e.g. API interceptors). Or use as controlled: <ApiErrorModal visible={...} onClose={...} message={...} />.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReusableBottomSheet } from './BottomSheet';
import { Button } from './Button';
import { InformativeIcon } from '../assets/icons/common/InformativeIcon';
import { colors, typography, spacing } from '../theme';

const AUTO_CLOSE_MS = 5000;

export interface ApiErrorModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when the user taps OK or when the modal auto-closes */
  onClose: () => void;
  /** Error message to show (default: generic message) */
  message?: string;
  /** Optional title (default: "Something went wrong") */
  title?: string;
}

const DEFAULT_TITLE = 'Something went wrong';
const DEFAULT_MESSAGE =
  "We couldn't complete your request right now. Please try again in a moment.";

export const ApiErrorModal: React.FC<ApiErrorModalProps> = ({
  visible,
  onClose,
  message = DEFAULT_MESSAGE,
  title = DEFAULT_TITLE,
}) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!visible) {
      clearAutoClose();
      return;
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onClose();
    }, AUTO_CLOSE_MS);
    return clearAutoClose;
  }, [visible, onClose]);

  const handleClose = () => {
    clearAutoClose();
    onClose();
  };

  return (
    <ReusableBottomSheet
      isOpen={visible}
      onClose={handleClose}
      snapPoints={['42%']}
      showDragHandle={true}
      showCloseButton={false}
      enablePanDownToClose={true}
      scrollEnabled={false}
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <InformativeIcon width={40} height={40} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Button
          title="OK"
          onPress={handleClose}
          variant="primary"
          style={styles.button}
        />
      </View>
    </ReusableBottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 1000,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    fontSize: 16,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  button: {
    alignSelf: 'stretch',
  },
});
