import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ReplyIconProps {
  size?: number;
  color?: string;
}

// Reply - curved arrow (from Frame 11.svg)
export const ReplyIcon: React.FC<ReplyIconProps> = ({
  size = 20,
  color = '#1A1A1A',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M16.6665 17.5V15.7692C16.6665 14.1017 16.6665 13.2681 16.5454 12.5705C15.8788 8.73042 12.5777 5.71869 8.36867 5.11049C7.60408 5 5.99415 5 4.1665 5"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.8335 2.5C5.3278 2.99153 3.3335 4.29977 3.3335 5C3.3335 5.70022 5.3278 7.00847 5.8335 7.5"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
