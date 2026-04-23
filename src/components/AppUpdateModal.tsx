/**
 * Store update prompt (Android Play in-app update + iOS App Store link) — Figma:
 * https://www.figma.com/design/FzV81n1GwiDC68GJhKdPMv/AIRA?node-id=3557-13281
 * Single primary CTA only (no “Remind me later”).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReusableBottomSheet } from './BottomSheet';
import { Button } from './Button';
import { InformativeIcon } from '../assets/icons/common/InformativeIcon';
import { STRINGS } from '../constants/strings';
import { colors, typography, spacing } from '../theme';

export interface AppUpdateModalProps {
  visible: boolean;
  onUpdatePress: () => void;
  loading?: boolean;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  visible,
  onUpdatePress,
  loading = false,
}) => {
  return (
    <ReusableBottomSheet
      isOpen={visible}
      onClose={() => {}}
      snapPoints={['42%']}
      showDragHandle={true}
      showCloseButton={false}
      enablePanDownToClose={false}
      closeOnBackdropPress={false}
      scrollEnabled={false}
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <InformativeIcon width={40} height={40} />
        </View>
        <Text style={styles.title}>{STRINGS.APP_UPDATE.TITLE}</Text>
        <Text style={styles.message}>{STRINGS.APP_UPDATE.MESSAGE}</Text>
        <Button
          title={STRINGS.APP_UPDATE.CTA}
          onPress={onUpdatePress}
          variant="primary"
          style={styles.button}
          loading={loading}
          disabled={loading}
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
