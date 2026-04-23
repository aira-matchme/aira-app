import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CallVideoMissedIconProps {
  size?: number;
  color?: string;
}

/** Conversation/call state icon from Figma (Frame-3). */
export const CallVideoMissedIcon: React.FC<CallVideoMissedIconProps> = ({
  size = 20,
  color = '#E60000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M14.168 7.42187L14.2729 7.33529C16.0361 5.88052 16.9176 5.15313 17.6261 5.50434C18.3346 5.85556 18.3346 7.01995 18.3346 9.34874V10.6519C18.3346 12.9807 18.3346 14.1451 17.6261 14.4963C16.9176 14.8475 16.0361 14.1202 14.2729 12.6653L14.168 12.5787M1.66797 9.16634C1.66797 6.41648 1.66797 5.04155 2.52224 4.18728C3.37651 3.33301 4.75144 3.33301 7.5013 3.33301H8.33464C11.0845 3.33301 12.4594 3.33301 13.3137 4.18728C14.168 5.04155 14.168 6.41648 14.168 9.16634V10.833C14.168 13.5828 14.168 14.9578 13.3137 15.8121C12.4594 16.6663 11.0845 16.6663 8.33464 16.6663H7.5013C4.75144 16.6663 3.37651 16.6663 2.52224 15.8121C1.66797 14.9578 1.66797 13.5828 1.66797 10.833V9.16634Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M8.68465 12.5016C8.68465 12.5016 6.16163 12.6989 5.80632 12.3436C5.45105 11.9884 5.64843 9.46533 5.64843 9.46533M5.95737 12.1926L9.97885 8"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
