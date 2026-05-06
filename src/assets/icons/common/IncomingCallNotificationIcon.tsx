import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IncomingCallNotificationIconProps {
  size?: number;
  color?: string;
}

/** Figma incoming call notification icon (Frame-2). */
export const IncomingCallNotificationIcon: React.FC<IncomingCallNotificationIconProps> = ({
  size = 10,
  color = '#404040',
}) => (
  <Svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <Path
      d="M7.08203 3.71045L7.13449 3.66716C8.01607 2.93977 8.45686 2.57608 8.81111 2.75168C9.16536 2.92729 9.16536 3.50949 9.16536 4.67388V5.32547C9.16536 6.48988 9.16536 7.07205 8.81111 7.24768C8.45686 7.42326 8.01607 7.05959 7.13449 6.33218L7.08203 6.28888M0.832031 4.58268C0.832031 3.20775 0.832031 2.52029 1.25917 2.09315C1.6863 1.66602 2.37377 1.66602 3.7487 1.66602H4.16536C5.54028 1.66602 6.22774 1.66602 6.65491 2.09315C7.08203 2.52029 7.08203 3.20775 7.08203 4.58268V5.41602C7.08203 6.79093 7.08203 7.47839 6.65491 7.90556C6.22774 8.33268 5.54028 8.33268 4.16536 8.33268H3.7487C2.37377 8.33268 1.6863 8.33268 1.25917 7.90556C0.832031 7.47839 0.832031 6.79093 0.832031 5.41602V4.58268Z"
      stroke={color}
      strokeWidth={0.7}
    />
    <Path
      d="M4.34623 6.25079C4.34623 6.25079 3.08472 6.34946 2.90707 6.17182C2.72943 5.99418 2.82812 4.73266 2.82812 4.73266M2.98259 6.0963L4.99333 4"
      stroke={color}
      strokeWidth={0.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
