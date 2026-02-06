import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface FrameIconProps {
  size?: number;
  color?: string;
}

export const FrameIcon: React.FC<FrameIconProps> = ({
  size = 72,
  color = '#7742F0',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Rect
        x="1"
        y="1"
        width="70"
        height="70"
        rx="35"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M20.1667 29.6445C20.3402 26.1449 20.859 23.963 22.4111 22.4109C23.9633 20.8588 26.1452 20.3399 29.6447 20.1665M51.8334 29.6445C51.6599 26.1449 51.1411 23.963 49.5891 22.4109C48.0369 20.8588 45.8549 20.3399 42.3554 20.1665M42.3554 51.8332C45.8549 51.6597 48.0369 51.1408 49.5891 49.5888C51.1411 48.0367 51.6599 45.8547 51.8334 42.3552M29.6447 51.8332C26.1452 51.6597 23.9633 51.1408 22.4111 49.5888C20.859 48.0367 20.3402 45.8547 20.1667 42.3552"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M45.1666 44.3333L44.8296 42.9185C44.5511 41.7495 43.6648 40.8208 42.5101 40.4882L38.4999 39.3323L38.4994 36.8863C39.9939 35.8777 40.9994 33.9925 40.9994 31.8333C40.9994 28.6117 38.7608 26 35.9994 26C33.2379 26 30.9994 28.6117 30.9994 31.8333C30.9994 33.9925 32.0049 35.8777 33.4994 36.8863L33.4999 39.3323L29.5147 40.499C28.3957 40.8267 27.5292 41.715 27.2297 42.8418L26.8333 44.3333"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default FrameIcon;
