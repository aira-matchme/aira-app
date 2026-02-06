import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ForwardArrowIconProps {
  size?: number;
  color?: string;
}

export const ForwardArrowIcon: React.FC<ForwardArrowIconProps> = ({
  size = 36,
  color = 'white',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Horizontal line */}
      <Path
        d="M27.75 18H7.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead */}
      <Path
        d="M19.5 27C19.5 27 20.082 23.0349 22.05 21.15C23.9056 19.3727 28.5 18 28.5 18C28.5 18 23.9168 16.8455 22.05 14.85C20.4019 13.0883 19.5 9 19.5 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

