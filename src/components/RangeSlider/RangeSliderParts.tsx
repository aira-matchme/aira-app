import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography } from '../../theme';

/** Thumb: white center + purple glow - matches Figma 1572-3130 exactly */
export const Thumb: React.FC<{ name?: 'low' | 'high' }> = () => (
  <View style={styles.thumbOuter}>
    <View style={styles.thumb} />
  </View>
);

/** Rail: light gray track - Figma 1572-3130 unselected (#E0E0E0), pill-shaped */
export const Rail: React.FC = () => <View style={styles.rail} />;

/** RailSelected: purple segment - Figma 1572-3130 selected (#7742F0), pill-shaped */
export const RailSelected: React.FC = () => (
  <View style={styles.railSelected} />
);

interface LabelProps {
  text: string;
  pointerDirection?: 'up' | 'down';
}

/** Label: speech bubble with triangular pointer - matches Figma 1572-3129 */
export const Label: React.FC<LabelProps> = ({ text, pointerDirection }) => (
  <View style={styles.labelWrapper}>
    {pointerDirection === 'down' && (
      <>
        <View style={styles.label}>
          <Text style={styles.labelText}>{text}</Text>
        </View>
        <View style={[styles.triangle, styles.triangleDown]} />
      </>
    )}
    {pointerDirection === 'up' && (
      <>
        <View style={[styles.triangle, styles.triangleUp]} />
        <View style={styles.label}>
          <Text style={styles.labelText}>{text}</Text>
        </View>
      </>
    )}
    {!pointerDirection && (
      <View style={styles.label}>
        <Text style={styles.labelText}>{text}</Text>
      </View>
    )}
  </View>
);

const RAIL_HEIGHT = 12;
const THUMB_SIZE = 32;

const styles = StyleSheet.create({
  thumbOuter: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'rgba(119, 66, 240, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.purple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  rail: {
    flex: 1,
    height: RAIL_HEIGHT,
    borderRadius: RAIL_HEIGHT / 2,
    backgroundColor: '#E0E0E0',
  },
  railSelected: {
    height: RAIL_HEIGHT,
    borderRadius: RAIL_HEIGHT / 2,
    backgroundColor: colors.primary.purple,
  },
  labelWrapper: {
    alignItems: 'center',
  },
  label: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[800],
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  triangleDown: {
    borderTopWidth: 6,
    borderTopColor: colors.primary[100],
    marginTop: -1,
  },
  triangleUp: {
    borderBottomWidth: 6,
    borderBottomColor: colors.primary[100],
    marginBottom: -1,
  },
});
