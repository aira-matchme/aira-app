import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BellIconProps {
  size?: number;
  color?: string;
}

// From AIRA_icon Frame-2.svg (bell)
export const BellIcon: React.FC<BellIconProps> = ({
  size = 24,
  color = '#FFFFFF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.9168 15C12.9168 16.6108 11.611 17.9167 10.0002 17.9167C8.38933 17.9167 7.0835 16.6108 7.0835 15"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.0259 14.9997H3.97406C3.15996 14.9997 2.5 14.3397 2.5 13.5256C2.5 13.1347 2.6553 12.7598 2.93174 12.4833L3.43443 11.9806C3.90327 11.5118 4.16667 10.8758 4.16667 10.2128V7.91634C4.16667 4.69468 6.77834 2.08301 10 2.08301C13.2217 2.08301 15.8333 4.69467 15.8333 7.91634V10.2128C15.8333 10.8758 16.0967 11.5118 16.5656 11.9806L17.0682 12.4833C17.3447 12.7598 17.5 13.1347 17.5 13.5256C17.5 14.3397 16.84 14.9997 16.0259 14.9997Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
