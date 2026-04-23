import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VoiceControlSpeakerIconProps {
  size?: number;
  color?: string;
}

/** Speaker icon used in ringing controls (Figma 3624:15190). */
export const VoiceControlSpeakerIcon: React.FC<VoiceControlSpeakerIconProps> = ({
  size = 20,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.75 11.45V8.55c0-.48.39-.87.87-.87h2.1c.2 0 .4-.07.55-.2l2.41-2.1c.57-.5 1.46-.1 1.46.66v8.91c0 .76-.89 1.16-1.46.66l-2.41-2.1a.84.84 0 0 0-.55-.2h-2.1a.87.87 0 0 1-.87-.87Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.1 8.1a2.7 2.7 0 0 1 0 3.8M14.95 6.25a5.3 5.3 0 0 1 0 7.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
