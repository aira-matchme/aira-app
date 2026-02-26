import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface MoreHorizIconProps {
  size?: number;
  color?: string;
}

export const MoreHorizIcon: React.FC<MoreHorizIconProps> = ({
  size = 24,
  color = '#000000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={6} cy={12} r={1.5} fill={color} />
    <Circle cx={12} cy={12} r={1.5} fill={color} />
    <Circle cx={18} cy={12} r={1.5} fill={color} />
  </Svg>
);
