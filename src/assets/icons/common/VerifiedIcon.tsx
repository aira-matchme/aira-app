import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VerifiedIconProps {
  size?: number;
  color?: string;
}

export const VerifiedIcon: React.FC<VerifiedIconProps> = ({
  size = 24,
  color = 'white',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.5 4.20404C15.1762 3.43827 13.6393 3 12 3C7.02943 3 3 7.02943 3 12C3 16.9705 7.02943 21 12 21C16.9705 21 21 16.9705 21 12C21 11.3836 20.938 10.7816 20.82 10.2M8.4 12.45C8.4 12.45 9.75 12.45 11.55 15.6C11.55 15.6 16.5529 7.35 21 5.7"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

