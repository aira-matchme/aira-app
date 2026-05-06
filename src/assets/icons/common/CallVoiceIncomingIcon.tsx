import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CallVoiceIncomingIconProps {
  size?: number;
  color?: string;
}

/** Conversation/call state icon from Figma (Frame-8). */
export const CallVoiceIncomingIcon: React.FC<CallVoiceIncomingIconProps> = ({
  size = 20,
  color = '#7742F0',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M4.09322 8.78442L6.29358 6.58407C6.74243 6.13523 6.89774 5.47202 6.7162 4.86377C6.57425 4.38814 6.41432 3.81637 6.30801 3.32743C6.20969 2.87522 5.81288 2.5 5.3501 2.5H4.09322C3.16767 2.5 2.40759 3.2532 2.50912 4.17317C3.28091 11.1663 8.83367 16.7191 15.8268 17.4909C16.7468 17.5924 17.5 16.8323 17.5 15.9068V14.6499C17.5 14.1872 17.1233 13.8075 16.6679 13.7247C16.1657 13.6333 15.6343 13.4837 15.1897 13.3419C14.5509 13.1383 13.8409 13.2814 13.3669 13.7554L11.2156 15.9068"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.0571 3.94484L11.668 8.33399M12.5013 3.58064C13.5474 3.48963 15.8737 3.06512 16.4053 3.59668C16.9368 4.12824 16.5123 6.45453 16.4213 7.50065"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
