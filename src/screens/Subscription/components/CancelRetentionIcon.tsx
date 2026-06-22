import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme';

const ICON_SIZE = 80;
const EMOJI_SIZE = 40;

/** Figma 4215:16940 — 80px violet circle with retention emoji. */
export const CancelRetentionIcon: React.FC = () => (
  <View style={styles.circle}>
    <Text style={styles.emoji} accessibilityLabel="Sad face">
      🥲
    </Text>
  </View>
);

const styles = StyleSheet.create({
  circle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: EMOJI_SIZE,
    lineHeight: EMOJI_SIZE + 4,
    textAlign: 'center',
  },
});
