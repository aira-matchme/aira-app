import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LogoutExitIconProps {
  size?: number;
  color?: string;
}

/** Door + arrow exit — matches design asset (40×40 viewBox). */
export const LogoutExitIcon: React.FC<LogoutExitIconProps> = ({
  size = 40,
  color = '#7742F0',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M25.5263 13.7477C25.4613 11.9149 25.2446 10.7699 24.5229 9.87334C23.4917 8.59226 21.728 8.19007 18.2008 7.38571L16.6197 7.02515C11.2604 5.80299 8.58069 5.1919 6.79034 6.59933C5 8.00675 5 10.7244 5 16.1596V23.8396C5 29.2748 5 31.9925 6.79034 33.3998C8.58069 34.8073 11.2604 34.1962 16.6197 32.974L18.2008 32.6135C21.728 31.8092 23.4917 31.4068 24.5229 30.1258C25.2446 29.2293 25.4613 28.0843 25.5263 26.2514M30.2632 15.2812C30.2632 15.2812 35 18.7699 35 20.0181C35 21.2664 30.2632 24.7549 30.2632 24.7549M34.2105 20.0181H14.4737"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
