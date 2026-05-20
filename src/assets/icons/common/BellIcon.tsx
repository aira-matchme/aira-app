import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BellIconProps {
  size?: number;
  color?: string;
}

/** Figma Home header notification bell — outline, 24×24 */
export const BellIcon: React.FC<BellIconProps> = ({
  size = 24,
  color = '#000000',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.00146 19H14.9985"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.749 15.75V9.75C18.749 5.85 15.649 2.75 11.749 2.75C7.849 2.75 4.74902 5.85 4.74902 9.75V15.75L2.99902 17.5V18.25H20.499V17.5L18.749 15.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
