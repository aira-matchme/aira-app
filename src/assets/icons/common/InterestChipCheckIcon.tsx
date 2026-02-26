import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface InterestChipCheckIconProps {
  size?: number;
  color?: string;
}

/**
 * Checkmark for selected interest chip – from Figma Select Hobbies Frame-3.
 */
export const InterestChipCheckIcon: React.FC<InterestChipCheckIconProps> = ({
  size = 20,
  color = '#7742F0',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4.16699 12.083C4.16699 12.083 5.41699 12.083 7.08366 14.9997C7.08366 14.9997 11.716 7.36078 15.8337 5.83301"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
