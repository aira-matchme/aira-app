import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface AudioEarpieceIconProps {
  size?: number;
  color?: string;
}

export const AudioEarpieceIcon: React.FC<AudioEarpieceIconProps> = ({
  size = 20,
  color = '#737373',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect x={5.5} y={2.8} width={9} height={14.4} rx={2.2} stroke={color} strokeWidth={1.5} />
    <Path d="M8.3 5.8h3.4M8.3 14.4h3.4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);
