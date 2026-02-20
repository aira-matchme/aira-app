import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BlockIconProps {
  size?: number;
  color?: string;
}

/** Block icon – circle with diagonal line (Figma 1690-5446) */
export const BlockIcon: React.FC<BlockIconProps> = ({
  size = 20,
  color = '#000000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M4.60825 4.4L15.8083 15.6M18.2083 10C18.2083 5.58172 14.6265 2 10.2083 2C5.78997 2 2.20825 5.58172 2.20825 10C2.20825 14.4182 5.78997 18 10.2083 18C14.6265 18 18.2083 14.4182 18.2083 10Z"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
