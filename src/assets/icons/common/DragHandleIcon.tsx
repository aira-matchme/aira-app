import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface DragHandleIconProps {
  size?: number;
  color?: string;
}

export const DragHandleIcon: React.FC<DragHandleIconProps> = ({
  size = 24,
  color = '#1A1A1A',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={14.875} cy={6.125} r={1.125} fill={color} />
    <Circle cx={8.875} cy={6.125} r={1.125} fill={color} />
    <Circle cx={14.875} cy={12.125} r={1.125} fill={color} />
    <Circle cx={8.875} cy={12.125} r={1.125} fill={color} />
    <Circle cx={14.875} cy={18.125} r={1.125} fill={color} />
    <Circle cx={8.875} cy={18.125} r={1.125} fill={color} />
  </Svg>
);
