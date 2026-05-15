/**
 * Request timed out modal (Figma: 2101-16435).
 * - Title: "Request timed out", message: "It took longer than expected. Please try again."
 * - Retry button: calls the stored retry callback (re-runs the failed API) and closes the popup.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReusableBottomSheet } from './BottomSheet';
import { Button } from './Button';
import { InformativeIcon } from '../assets/icons/common/InformativeIcon';
import { colors, typography, spacing } from '../theme';
import { useApiTimeoutStore } from '../store/apiTimeout.store';

const TITLE = 'Request timed out';
const MESSAGE = 'It took longer than expected. Please try again.';

export const RequestTimeoutModal: React.FC = () => {
  const { visible, retry, hideTimeout } = useApiTimeoutStore();

  const handleRetry = () => {
    if (retry) {
      retry();
    }
    hideTimeout();
  };

  const handleDismiss = () => {
    hideTimeout({ cancelled: true });
  };

  return (
    <ReusableBottomSheet
      isOpen={visible}
      onClose={handleDismiss}
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
        <Text style={styles.title}>{TITLE}</Text>
        <Text style={styles.message}>{MESSAGE}</Text>
        <Button
          title="Retry"
          onPress={handleRetry}
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
