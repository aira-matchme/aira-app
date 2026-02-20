import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

type TabLikesIconProps = SvgProps & { color?: string; filled?: boolean };

// From AIRA_icon Like.svg - heart path
const likePath =
  "M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z";

export const TabLikesIcon: React.FC<TabLikesIconProps> = ({
  color = '#8C8C8C',
  filled = false,
  width = 24,
  height = 24,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d={likePath}
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
