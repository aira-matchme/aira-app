import React from 'react';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

// Simple circular bullet icon for Essentials list (MatchDetails)
export const EssentialBulletIcon: React.FC<Props> = ({
  size = 16,
  color = '#7C3AED',
}) => {
  const radius = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Circle cx={radius} cy={radius} r={radius} fill={color} />
    </Svg>
  );
};

