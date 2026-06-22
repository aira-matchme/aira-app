import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { colors, typography } from '../../../theme';
import { useCancelRetentionStats } from '../hooks/useCancelRetentionStats';
import { MANAGE_FOOTER_BUTTON_HEIGHT, scaleManage } from '../manageLayout';
import { CancelRetentionIcon } from './CancelRetentionIcon';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onStay: () => void;
  onCancelAnyway: () => void;
};

function formatMatchLabel(count: number): string {
  return `${count} active match${count === 1 ? '' : 'es'}`;
}

function formatSuggestionLabel(count: number): string {
  return `${count} unused AI suggestion${count === 1 ? '' : 's'}`;
}

export const CancelSubscriptionRetentionSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  onStay,
  onCancelAnyway,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { activeMatches, unusedAiSuggestions, isLoading } =
    useCancelRetentionStats(isOpen);

  const sheetHeight = useMemo(
    () => Math.min(screenHeight * 0.58, scaleManage(460, screenWidth)),
    [screenHeight, screenWidth],
  );

  const showPersonalizedCopy =
    !isLoading && (activeMatches > 0 || unusedAiSuggestions > 0);

  return (
    <ReusableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[sheetHeight]}
      showDragHandle
      showCloseButton={false}
      enablePanDownToClose
      scrollEnabled={false}
      backdropStyle={styles.backdrop}
      backgroundStyle={styles.sheetSurface}
      dragHandleStyle={styles.dragHandle}
      dragHandleContainerStyle={styles.dragHandleContainer}
    >
      <View
        style={[styles.body, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.hero}>
          <CancelRetentionIcon />

          <View style={styles.copyBlock}>
            {showPersonalizedCopy ? (
              <View style={styles.titleBlock}>
                <Text style={styles.title}>
                  You have{' '}
                  <Text style={styles.accent}>
                    {formatMatchLabel(activeMatches)}
                  </Text>{' '}
                  &
                </Text>
                <Text style={styles.title}>
                  <Text style={styles.accent}>
                    {formatSuggestionLabel(unusedAiSuggestions)}
                  </Text>
                </Text>
              </View>
            ) : (
              <Text style={styles.title}>
                You have{' '}
                <Text style={styles.accent}>premium features</Text> active
              </Text>
            )}

            <Text style={styles.subtitle}>
              These will be locked if you cancel.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Stay"
            onPress={onStay}
            variant="primary"
            centerTitleOnly
            style={styles.primaryButton}
          />

          <TouchableOpacity
            onPress={onCancelAnyway}
            activeOpacity={0.85}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Cancel Anyway</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ReusableBottomSheet>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.background.darkOverlay,
  },
  sheetSurface: {
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  dragHandleContainer: {
    paddingTop: 8,
    paddingBottom: 0,
  },
  dragHandle: {
    width: 30,
    height: 4,
    borderRadius: 100,
    backgroundColor: colors.neutral[200],
  },
  body: {
    flex: 1,
    gap: 24,
    paddingTop: 24,
    paddingHorizontal: 0,
  },
  hero: {
    alignItems: 'center',
    gap: 24,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 0,
    width: '100%',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    textAlign: 'center',
  },
  accent: {
    color: colors.primary.purple,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[300],
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
  secondaryButton: {
    minHeight: MANAGE_FOOTER_BUTTON_HEIGHT,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    textAlign: 'center',
  },
});
