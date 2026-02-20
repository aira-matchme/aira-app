// LinkIcon.tsx

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ActionSheetFileIconProps {
  size?: number;
  color?: string;
}

export const ActionSheetFileIcon: React.FC<ActionSheetFileIconProps> = ({
  size = 32,
  color = '#7742F0',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <Path
        d="M7.76463 16L5.70575 13.9411C3.43158 11.667 3.43158 7.9798 5.70575 5.70563C7.97992 3.43146 11.6671 3.43146 13.9412 5.70563L26.2945 18.0589C28.5687 20.3331 28.5687 24.0203 26.2945 26.2944C24.0204 28.5685 20.3332 28.5685 18.0591 26.2944L13.4265 21.6619C12.0052 20.2405 12.0052 17.9361 13.4265 16.5147C14.8479 15.0933 17.1524 15.0933 18.5737 16.5147L21.1473 19.0883"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
