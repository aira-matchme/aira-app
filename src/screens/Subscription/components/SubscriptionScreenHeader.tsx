import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { colors, typography } from '../../../theme';
import { MANAGE_BACK_SIZE, MANAGE_SCREEN_PAD_H } from '../manageLayout';

type SubscriptionScreenHeaderProps = {
  title?: string;
  onBack: () => void;
};

export const SubscriptionScreenHeader: React.FC<SubscriptionScreenHeaderProps> = ({
  title,
  onBack,
}) => (
  <View style={styles.wrap}>
    <TouchableOpacity
      onPress={onBack}
      activeOpacity={0.85}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <BackArrowIcon size={MANAGE_BACK_SIZE} backgroundColor={colors.neutral[50]} strokeColor={colors.black} />
    </TouchableOpacity>
    {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.titleSpacer} />}
    <View style={styles.sideSpacer} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
    paddingHorizontal: MANAGE_SCREEN_PAD_H,
    minHeight: MANAGE_BACK_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: -0.2,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
  },
  titleSpacer: {
    flex: 1,
  },
  sideSpacer: {
    width: MANAGE_BACK_SIZE,
  },
});
