import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ShapeMatchesIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

/**
 * Two stylized person figures – "Let's shape your matches" / preferences start.
 * From Figma Frame (12).svg
 */
export const ShapeMatchesIcon: React.FC<ShapeMatchesIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = '#7742F0',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M21.6663 18.3327C21.6663 14.6508 18.6815 11.666 14.9997 11.666C11.3178 11.666 8.33301 14.6508 8.33301 18.3327C8.33301 22.0145 11.3178 24.9993 14.9997 24.9993C18.6815 24.9993 21.6663 22.0145 21.6663 18.3327Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.3973 12.5962C18.3548 12.2925 18.333 11.9821 18.333 11.6667C18.333 7.98477 21.3178 5 24.9997 5C28.6815 5 31.6663 7.98477 31.6663 11.6667C31.6663 15.3486 28.6815 18.3333 24.9997 18.3333C23.7587 18.3333 22.597 17.9943 21.602 17.4038"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25 35C25 29.4772 20.5228 25 15 25C9.47715 25 5 29.4772 5 35"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M35 28.334C35 22.8112 30.5228 18.334 25 18.334"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
