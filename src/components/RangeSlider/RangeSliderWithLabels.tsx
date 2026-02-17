import React from 'react';
import { View, StyleSheet } from 'react-native';
import RangeSlider from 'rn-range-slider';
import { Thumb, Rail, RailSelected, Label } from './RangeSliderParts';

const SLIDER_HEIGHT = 60;
const SECTION_MIN_HEIGHT = 340;
const LABEL_OFFSET = 36;

interface RangeSliderWithLabelsProps {
  min: number;
  max: number;
  step: number;
  minRange: number;
  low: number;
  high: number;
  onValueChanged: (low: number, high: number) => void;
  formatLabel: (value: number) => string;
  renderThumb: () => React.ReactNode;
  renderRail: () => React.ReactNode;
  renderRailSelected: () => React.ReactNode;
}

/** Range slider with both labels visible - low above left thumb, high below right thumb */
export const RangeSliderWithLabels: React.FC<RangeSliderWithLabelsProps> = ({
  min,
  max,
  step,
  minRange,
  low,
  high,
  onValueChanged,
  formatLabel,
  renderThumb,
  renderRail,
  renderRailSelected,
}) => {
  const lowPercent = ((low - min) / (max - min)) * 100;
  const highPercent = ((high - min) / (max - min)) * 100;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.labelAbove,
          { left: `${lowPercent}%`, marginLeft: -LABEL_OFFSET },
        ]}
      >
        <Label text={formatLabel(low)} pointerDirection="down" />
      </View>

      <RangeSlider
        style={styles.slider}
        min={min}
        max={max}
        step={step}
        minRange={minRange}
        low={low}
        high={high}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        onValueChanged={(l, h) => onValueChanged(l, h)}
      />

      <View
        style={[
          styles.labelBelow,
          { left: `${highPercent}%`, marginLeft: -LABEL_OFFSET },
        ]}
      >
        <Label text={formatLabel(high)} pointerDirection="up" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minHeight: SECTION_MIN_HEIGHT,
    paddingVertical: 8,
  },
  slider: {
    width: '100%',
    height: SLIDER_HEIGHT,
    marginTop: 40,
  },
  labelAbove: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  labelBelow: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
    alignItems: 'center',
  },
});
