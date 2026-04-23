import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VoiceControlVideoOffIconProps {
  size?: number;
  color?: string;
}

/** Video-off icon used in ringing controls (Figma 3624:15195). */
export const VoiceControlVideoOffIcon: React.FC<VoiceControlVideoOffIconProps> = ({
  size = 20,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M12.08 8.2l.08-.07c1.4-1.15 2.1-1.73 2.66-1.45.56.28.56 1.2.56 3.04v.56c0 1.84 0 2.76-.56 3.04-.56.28-1.26-.3-2.66-1.45l-.08-.06"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4.15 13.95c-.66-.66-.66-1.73-.66-3.87v-.16c0-2.2 0-3.3.68-3.98.68-.68 1.77-.68 3.96-.68h.74c2.2 0 3.3 0 3.98.68.68.68.68 1.78.68 3.98v.16c0 2.14 0 3.21-.66 3.87-.66.66-1.73.66-3.87.66H8.02c-2.14 0-3.21 0-3.87-.66Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M5.2 5.2 14.8 14.8"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </Svg>
);
