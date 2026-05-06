import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface VoiceControlMessageIconProps {
  size?: number;
  color?: string;
}

/** Message icon for incoming voice call action row. */
export const VoiceControlMessageIcon: React.FC<VoiceControlMessageIconProps> = ({
  size = 20,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M5.35 14.75a4.8 4.8 0 0 1-2.85-4.4c0-3.1 2.84-5.6 6.34-5.6 3.5 0 6.34 2.5 6.34 5.6s-2.84 5.6-6.34 5.6c-.64 0-1.25-.08-1.83-.24l-2.67.99c-.35.13-.67-.2-.54-.55l.92-2.4Z"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7.6" cy="10.35" r="0.85" fill={color} />
    <Circle cx="10.1" cy="10.35" r="0.85" fill={color} />
    <Circle cx="12.6" cy="10.35" r="0.85" fill={color} />
  </Svg>
);
