import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VoiceControlMicOffIconProps {
  size?: number;
  color?: string;
}

/** Mic-off icon for muted voice call control state. */
export const VoiceControlMicOffIcon: React.FC<VoiceControlMicOffIconProps> = ({
  size = 24,
  color = '#E50000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15.2a3.2 3.2 0 0 0 3.2-3.2V7.2a3.2 3.2 0 1 0-6.4 0V12a3.2 3.2 0 0 0 3.2 3.2Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.2 11.2V12a5.2 5.2 0 1 1-10.4 0v-.8M12 17.2V20M9.4 20h5.2"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 5l14 14"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
    />
  </Svg>
);
