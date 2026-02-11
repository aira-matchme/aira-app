import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CameraIconProps {
  size?: number;
  color?: string;
}

export const CameraIcon: React.FC<CameraIconProps> = ({
  size = 80,
  color = 'rgba(255, 255, 255, 0.9)',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Path
        d="M40 52C46.0751 52 51 47.0751 51 41C51 34.9249 46.0751 30 40 30C33.9249 30 29 34.9249 29 41C29 47.0751 33.9249 52 40 52Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M56 26L52 22H28L24 26H16C13.7909 26 12 27.7909 12 30V54C12 56.2091 13.7909 58 16 58H64C66.2091 58 68 56.2091 68 54V30C68 27.7909 66.2091 26 64 26H56Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CameraIcon;
