import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LocationPinIconProps {
  size?: number;
  color?: string;
}

// From AIRA_icon Frame-1.svg (location pin)
export const LocationPinIcon: React.FC<LocationPinIconProps> = ({
  size = 12,
  color = '#FFFFFF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M9.86687 7.46678C9.86687 8.49772 9.03114 9.33345 8.0002 9.33345C6.96927 9.33345 6.13354 8.49772 6.13354 7.46678C6.13354 6.43585 6.96927 5.60012 8.0002 5.60012C9.03114 5.60012 9.86687 6.43585 9.86687 7.46678Z"
        stroke={color}
        strokeWidth="0.8"
      />
      <Path
        d="M8.0002 2.66699C10.5978 2.66699 12.8002 4.81792 12.8002 7.42742C12.8002 10.0785 10.562 11.9388 8.4946 13.2039C8.34393 13.289 8.17353 13.3337 8.0002 13.3337C7.82686 13.3337 7.65646 13.289 7.5058 13.2039C5.44228 11.9265 3.2002 10.0876 3.2002 7.42742C3.2002 4.81792 5.40256 2.66699 8.0002 2.66699Z"
        stroke={color}
        strokeWidth="0.8"
      />
    </Svg>
  );
};
