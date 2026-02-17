import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface GalleryIconProps {
  size?: number;
  color?: string;
}

export const GalleryIcon: React.FC<GalleryIconProps> = ({
  size = 48,
  color = '#7742F0',
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Rect x={8} y={8} width={14} height={14} rx={2} stroke={color} strokeWidth={2} />
    <Rect x={26} y={8} width={14} height={14} rx={2} stroke={color} strokeWidth={2} />
    <Rect x={8} y={26} width={14} height={14} rx={2} stroke={color} strokeWidth={2} />
    <Rect x={26} y={26} width={14} height={14} rx={2} stroke={color} strokeWidth={2} />
  </Svg>
);
