import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ReportIconProps {
  size?: number;
  color?: string;
}

/** Report / warning icon – circle with exclamation (Figma 1690-5446) */
export const ReportIcon: React.FC<ReportIconProps> = ({
  size = 20,
  color = '#E60000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 6.8V10.4M10 13.1906V13.1986M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
      stroke={color}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
