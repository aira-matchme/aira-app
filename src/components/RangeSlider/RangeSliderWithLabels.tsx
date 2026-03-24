import React from 'react';
import { View, StyleSheet } from 'react-native';
import RangeSlider from 'rn-range-slider';
import { Thumb, Rail, RailSelected, Label } from './RangeSliderParts';

const SLIDER_HEIGHT = 60;
const SECTION_MIN_HEIGHT = 340;
const SLIDER_MARGIN_TOP = 40;
const LABEL_BELOW_TOP = SLIDER_MARGIN_TOP + SLIDER_HEIGHT; // exactly below the range rail

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
  const [wrapperWidth, setWrapperWidth] = React.useState(0);
  const [lowLabelWidth, setLowLabelWidth] = React.useState(0);
  const [highLabelWidth, setHighLabelWidth] = React.useState(0);
  const range = Math.max(max - min, 1);
  const lowRatio = (low - min) / range;
  const highRatio = (high - min) / range;

  const getClampedLeft = React.useCallback(
    (ratio: number, labelWidth: number) => {
      if (wrapperWidth <= 0 || labelWidth <= 0) return 0;
      const centerX = ratio * wrapperWidth;
      const rawLeft = centerX - labelWidth / 2;
      return Math.min(Math.max(rawLeft, 0), wrapperWidth - labelWidth);
    },
    [wrapperWidth]
  );

  const lowLeft = getClampedLeft(lowRatio, lowLabelWidth);
  const highLeft = getClampedLeft(highRatio, highLabelWidth);

  return (
    <View
      style={styles.wrapper}
      onLayout={(event) => {
        setWrapperWidth(event.nativeEvent.layout.width);
      }}
    >
      <View
        style={[
          styles.labelAbove,
          { left: lowLeft },
        ]}
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          if (nextWidth !== lowLabelWidth) setLowLabelWidth(nextWidth);
        }}
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
          { left: highLeft },
        ]}
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          if (nextWidth !== highLabelWidth) setHighLabelWidth(nextWidth);
        }}
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
    marginTop: SLIDER_MARGIN_TOP,
  },
  labelAbove: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  labelBelow: {
    position: 'absolute',
    top: LABEL_BELOW_TOP,
    zIndex: 1,
    alignItems: 'center',
  },
});
