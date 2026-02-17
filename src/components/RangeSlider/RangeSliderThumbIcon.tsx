import React from 'react';
import Svg, { Circle, Defs, Filter, FeFlood, FeBlend, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite } from 'react-native-svg';

interface RangeSliderThumbIconProps {
  size?: number;
}

/**
 * Thumb icon from Figma Frame 407 (1572-3132).
 * White center with outer glow, designed for use on purple selected rail.
 */
export const RangeSliderThumbIcon: React.FC<RangeSliderThumbIconProps> = ({
  size = 40,
}) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Defs>
      <Filter
        id="filter0_i_1572_3132"
        x="0"
        y="0"
        width="40"
        height="40"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix" />
        <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <FeColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <FeOffset />
        <FeGaussianBlur stdDeviation="4" />
        <FeComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <FeColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
        <FeBlend mode="normal" in2="shape" result="effect1_innerShadow_1572_3132" />
      </Filter>
      <Filter
        id="filter1_i_1572_3132"
        x="8"
        y="8"
        width="24"
        height="24"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix" />
        <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <FeColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <FeOffset />
        <FeGaussianBlur stdDeviation="4" />
        <FeComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <FeColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
        <FeBlend mode="normal" in2="shape" result="effect1_innerShadow_1572_3132" />
      </Filter>
    </Defs>
    <Circle
      cx="20"
      cy="20"
      r="20"
      fill="white"
      fillOpacity="0.1"
      filter="url(#filter0_i_1572_3132)"
    />
    <Circle
      cx="20"
      cy="20"
      r="19.5"
      stroke="white"
      strokeOpacity="0.2"
      fill="none"
    />
    <Circle
      cx="20"
      cy="20"
      r="12"
      fill="white"
      filter="url(#filter1_i_1572_3132)"
    />
  </Svg>
);
