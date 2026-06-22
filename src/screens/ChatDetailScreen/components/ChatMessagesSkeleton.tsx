import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../../theme';
import { BUBBLE_MAX_WIDTH } from '../styles';

type SkeletonBubbleProps = {
  width: number;
  height: number;
  align: 'left' | 'right';
  tone?: 'neutral' | 'sent';
};

function SkeletonBubble({ width, height, align, tone = 'neutral' }: SkeletonBubbleProps) {
  return (
    <View style={[styles.messageRow, align === 'left' ? styles.messageRowLeft : styles.messageRowRight]}>
      <View
        style={[
          styles.bubble,
          tone === 'sent' ? styles.bubbleSent : styles.bubbleNeutral,
          { width, height },
        ]}
      />
    </View>
  );
}

export const ChatMessagesSkeleton: React.FC = () => (
  <View style={styles.wrap} accessibilityLabel="Loading messages">
    <View style={styles.datePill}>
      <View style={styles.datePillBar} />
    </View>

    <SkeletonBubble align="left" width={Math.min(BUBBLE_MAX_WIDTH, 228)} height={44} />
    <SkeletonBubble align="right" width={Math.min(BUBBLE_MAX_WIDTH, 176)} height={36} tone="sent" />
    <SkeletonBubble align="left" width={Math.min(BUBBLE_MAX_WIDTH, 252)} height={56} />
    <View style={[styles.messageRow, styles.messageRowRight]}>
      <View style={[styles.imageSkeleton, { width: 200, height: 200 }]} />
    </View>
    <SkeletonBubble align="right" width={Math.min(BUBBLE_MAX_WIDTH, 148)} height={36} tone="sent" />
    <SkeletonBubble align="left" width={Math.min(BUBBLE_MAX_WIDTH, 196)} height={44} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    gap: 8,
  },
  datePill: {
    alignSelf: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  datePillBar: {
    width: 72,
    height: 14,
    borderRadius: 8,
    backgroundColor: colors.neutral[50],
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    borderRadius: 20,
  },
  bubbleNeutral: {
    backgroundColor: colors.neutral[50],
    borderBottomLeftRadius: 6,
  },
  bubbleSent: {
    backgroundColor: colors.primary[50],
    borderBottomRightRadius: 6,
  },
  imageSkeleton: {
    borderRadius: 20,
    borderBottomRightRadius: 6,
    backgroundColor: colors.neutral[50],
  },
});
