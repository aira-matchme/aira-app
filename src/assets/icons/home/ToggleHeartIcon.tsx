import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ToggleHeartIconProps {
  size?: number;
  color?: string;
}

// From Figma AIRA_icon (4) Like.svg
export const ToggleHeartIcon: React.FC<ToggleHeartIconProps> = ({
  size = 24,
  color = '#FFFFFF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Path
        d="M13.0134 24.9596C9.48677 22.3225 2.5 16.2935 2.5 10.8681C2.5 7.28204 5.13158 4.375 8.75 4.375C10.625 4.375 12.5 5 15 7.5C17.5 5 19.375 4.375 21.25 4.375C24.8684 4.375 27.5 7.28204 27.5 10.8681C27.5 16.2935 20.5132 22.3225 16.9866 24.9596C15.7999 25.847 14.2001 25.847 13.0134 24.9596Z"
        fill={color}
      />
    </Svg>
  );
};
