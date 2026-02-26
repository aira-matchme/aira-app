import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface GeneratingCloseIconProps {
  size?: number;
  color?: string;
}

export const GeneratingCloseIcon: React.FC<GeneratingCloseIconProps> = ({
  size = 18,
  color = 'black',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
    >
      <Path
        d="M13.5 4.5L4.50061 13.4994M13.4994 13.5L4.5 4.50064"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};