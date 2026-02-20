import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PauseIconProps {
  size?: number;
  color?: string;
}

/** Pause icon – two vertical bars (Figma 1673-4383 voice recording) */
export const PauseIcon: React.FC<PauseIconProps> = ({
  size = 20,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M6 4H8V16H6V4Z"
      fill={color}
    />
    <Path
      d="M12 4H14V16H12V4Z"
      fill={color}
    />
  </Svg>
);
