import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronDownCircleIconProps {
  size?: number;
  strokeColor?: string;
}

/**
 * Category collapse/expand icon (chevron down in circle) from Figma Select Hobbies – Frame-2.
 */
export const ChevronDownCircleIcon: React.FC<ChevronDownCircleIconProps> = ({
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
        d="M16 11C16 11 13.054 15 12 15C10.9459 15 8 11 8 11"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
