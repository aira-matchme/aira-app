import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface BackArrowIconProps {
  size?: number;
  backgroundColor?: string;
  strokeColor?: string;
  /** Fully circular mask (e.g. video call header in Figma). */
  circular?: boolean;
}

export const BackArrowIcon: React.FC<BackArrowIconProps> = ({
  size = 48,
  backgroundColor = '#FFFFFF',
  strokeColor = '#000000',
  circular = false,
}) => {
  const rx = circular ? size / 2 : 16;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect width="48" height="48" rx={rx} fill={backgroundColor} />
      <Path
        d="M15.875 24H32.75"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.75 31.5C22.75 31.5 22.265 28.1957 20.625 26.625C19.0786 25.1439 15.25 24 15.25 24C15.25 24 19.0694 23.0379 20.625 21.375C21.9984 19.9069 22.75 16.5 22.75 16.5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};



