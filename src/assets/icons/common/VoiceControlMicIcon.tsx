import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VoiceControlMicIconProps {
  size?: number;
  color?: string;
}

/** Mic icon used in ringing controls (Figma 3624:15200). */
export const VoiceControlMicIcon: React.FC<VoiceControlMicIconProps> = ({
  size = 20,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 12.5a2.5 2.5 0 0 0 2.5-2.5V6.67a2.5 2.5 0 1 0-5 0V10A2.5 2.5 0 0 0 10 12.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.17 9.58V10a4.17 4.17 0 1 1-8.34 0v-.42M10 14.17v2.08M7.92 16.25h4.16"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
