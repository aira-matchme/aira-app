import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface MoreVertIconProps {
  size?: number;
  color?: string;
}

export const MoreVertIcon: React.FC<MoreVertIconProps> = ({
  size = 24,
  color = '#000000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={6} r={1.5} fill={color} />
    <Circle cx={12} cy={12} r={1.5} fill={color} />
    <Circle cx={12} cy={18} r={1.5} fill={color} />
  </Svg>
);
