import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** Figma AIRA — video call header control (node 3597-8637). */
interface ChatHeaderVideoCallIconProps {
  size?: number;
  color?: string;
}

export const ChatHeaderVideoCallIcon: React.FC<ChatHeaderVideoCallIconProps> = ({
  size = 24,
  color = '#1A1A1A',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 7.99941H13M17 8.90527L17.1259 8.80138C19.2417 7.05565 20.2996 6.18278 21.1498 6.60424C22 7.0257 22 8.42297 22 11.2175V12.7813C22 15.5759 22 16.9731 21.1498 17.3946C20.2996 17.816 19.2417 16.9432 17.1259 15.1974L17 15.0935M2 11.001C2 7.70115 2 6.05123 3.02513 5.02611C4.05025 4.00098 5.70017 4.00098 9 4.00098H10C13.2998 4.00098 14.9497 4.00098 15.9749 5.02611C17 6.05123 17 7.70115 17 11.001V13.001C17 16.3008 17 17.9507 15.9749 18.9759C14.9497 20.001 13.2998 20.001 10 20.001H9C5.70017 20.001 4.05025 20.001 3.02513 18.9759C2 17.9507 2 16.3008 2 13.001V11.001Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
