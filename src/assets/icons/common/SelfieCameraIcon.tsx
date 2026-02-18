import * as React from 'react';
import Svg, { Rect, SvgProps } from 'react-native-svg';

const SelfieCameraIcon: React.FC<SvgProps> = (props) => {
  return (
    <Svg
      width={56}
      height={56}
      viewBox="0 0 56 56"
      fill="none"
      {...props}
    >
      <Rect
        x={0.5}
        y={0.5}
        width={55}
        height={55}
        rx={27.5}
        stroke="white"
      />

      <Rect
        x={4}
        y={4}
        width={48}
        height={48}
        rx={24}
        fill="white"
      />
    </Svg>
  );
};

export { SelfieCameraIcon };
