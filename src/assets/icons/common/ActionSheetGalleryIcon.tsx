import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ActionSheetGalleryIconProps {
  size?: number;
  color?: string;
}

export const ActionSheetGalleryIcon: React.FC<ActionSheetGalleryIconProps> = ({
  size = 32,
  color = '#7742F0',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M16 15.9998C19.6819 15.9998 22.6667 12.9901 22.6667 9.27732C22.6667 6.49341 20.9885 4.10474 18.5967 3.08381C17.6613 2.6846 17.1937 2.485 16.5968 2.8838C16 3.28258 16 3.93633 16 5.24381V15.9998Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Path
      d="M16.0002 16C12.3183 16 9.3335 19.0097 9.3335 22.7225C9.3335 25.5064 11.0116 27.8951 13.4035 28.916C14.3388 29.3152 14.8064 29.5148 15.4034 29.116C16.0002 28.7172 16.0002 28.0635 16.0002 26.756V16Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Path
      d="M16 16C16 19.6819 19.0097 22.6667 22.7225 22.6667C25.5064 22.6667 27.8951 20.9885 28.916 18.5967C29.3152 17.6613 29.5148 17.1937 29.116 16.5968C28.7172 16 28.0635 16 26.756 16H16Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Path
      d="M15.9998 16.0002C15.9998 12.3183 12.9901 9.3335 9.27732 9.3335C6.49341 9.3335 4.10474 11.0116 3.08381 13.4035C2.6846 14.3388 2.485 14.8064 2.8838 15.4034C3.28258 16.0002 3.93633 16.0002 5.24381 16.0002H15.9998Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);
