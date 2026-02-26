import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronUpCircleIconProps {
  size?: number;
  strokeColor?: string;
}

/**
 * Category expanded state icon (chevron up in circle) – same as Frame-2 with chevron flipped.
 */
export const ChevronUpCircleIcon: React.FC<ChevronUpCircleIconProps> = ({
  size = 24,
  strokeColor = '#1A1A1A',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <Path
        d="M8 13C8 13 10.946 9 12 9C13.054 9 16 13 16 13"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
