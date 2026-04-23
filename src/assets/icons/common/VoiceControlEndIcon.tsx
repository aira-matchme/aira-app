import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VoiceControlEndIconProps {
  size?: number;
  color?: string;
}

/** Compact hang-up icon used in ringing controls (Figma 3624:15187). */
export const VoiceControlEndIcon: React.FC<VoiceControlEndIconProps> = ({
  size = 20,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M13.35 14.35l.02.1c.08.44.12.67.25.85.04.06.09.12.14.17.16.17.38.27.82.45.61.26.92.39 1.21.34.09-.02.17-.04.25-.08.25-.12.43-.37.8-.95.38-.6.57-.9.54-1.24-.01-.08-.03-.18-.06-.25-.1-.32-.34-.5-.84-.83-4-2.75-8.81-2.75-12.81 0-.5.33-.74.51-.84.83-.03.07-.05.17-.06.25-.03.34.16.64.54 1.24.37.58.55.83.8.95.08.04.16.06.25.08.29.05.6-.08 1.21-.34.44-.18.66-.28.82-.45.05-.05.1-.11.14-.17.13-.18.17-.41.25-.85l.02-.1c.08-.46.12-.69.29-.89.03-.03.07-.07.1-.09.2-.18.39-.23.77-.32.99-.24 2.13-.24 3.12 0 .38.09.57.14.77.32.03.02.07.06.1.09.17.2.21.43.29.89Z"
      stroke={color}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
