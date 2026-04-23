import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface AudioOptionCheckIconProps {
  size?: number;
  color?: string;
}

export const AudioOptionCheckIcon: React.FC<AudioOptionCheckIconProps> = ({
  size = 16,
  color = '#7742F0',
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Circle cx={8} cy={8} r={6.5} stroke={color} />
    <Path
      d="M5.4 8.1l1.7 1.7 3.5-3.5"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
