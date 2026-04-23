import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AudioBluetoothIconProps {
  size?: number;
  color?: string;
}

export const AudioBluetoothIcon: React.FC<AudioBluetoothIconProps> = ({
  size = 20,
  color = '#7742F0',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10.25 3.5v13M10.25 3.5l4 3.75-4 2.75M10.25 16.5l4-3.75-4-2.75M5.75 6.25l8.5 7.5M5.75 13.75l8.5-7.5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
