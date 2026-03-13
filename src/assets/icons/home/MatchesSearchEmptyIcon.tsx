import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

// Icon derived from "Frame (21).svg" for dashboard empty state
export const MatchesSearchEmptyIcon: React.FC<Props> = ({
  size = 72,
  color = '#1A1A1A',
}) => {
  const dimension = size;
  const strokeWidth = 1.5 * (dimension / 72);

  return (
    <Svg
      width={dimension}
      height={dimension}
      viewBox="0 0 72 72"
      fill="none"
    >
      <Path
        d="M50.2695 50.2695C52.2953 48.2435 55.5795 48.2436 57.6055 50.2695L63.7305 56.3936C65.7564 58.4195 65.7565 61.7047 63.7305 63.7305C61.7047 65.7565 58.4195 65.7564 56.3936 63.7305L50.2695 57.6055C48.2436 55.5795 48.2435 52.2953 50.2695 50.2695ZM28.6094 6.92969C40.6152 6.92987 50.3389 16.7262 50.3389 28.7998C50.3388 40.8734 40.6151 50.6697 28.6094 50.6699C16.6035 50.6699 6.87897 40.8735 6.87891 28.7998C6.87891 16.7261 16.6035 6.92969 28.6094 6.92969ZM44.4697 44.4697C44.7442 44.1952 45.1781 44.178 45.4727 44.418L45.5303 44.4697L50.0303 48.9697C50.3229 49.2626 50.3231 49.7374 50.0303 50.0303C49.7557 50.3048 49.3209 50.3221 49.0264 50.082L48.9697 50.0303L44.4697 45.5303C44.1768 45.2374 44.1768 44.7626 44.4697 44.4697Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

