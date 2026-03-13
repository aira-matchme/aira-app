import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

// Icon derived from "Frame (14).svg" for height essential row
export const HeightEssentialIcon: React.FC<Props> = ({
  size = 20,
  color = '#BBA0F8',
}) => {
  const dimension = size;

  return (
    <Svg
      width={dimension}
      height={dimension}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Defs>
        <ClipPath id="height_essential_clip">
          <Rect width={20} height={20} fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#height_essential_clip)">
        <Path
          d="M6.44445 12.2667H9.64445M6.44445 8H9.64445M6.44445 3.73333H9.64445M14.8889 12.8C14.8889 14.3085 14.8889 15.0628 14.3103 15.5314C13.7318 16 12.8006 16 10.9383 16H9.95058C8.08827 16 7.15707 16 6.57858 15.5314C6 15.0628 6 14.3085 6 12.8V3.2C6 1.6915 6 0.937262 6.57858 0.468631C7.15707 0 8.08827 0 9.95058 0H10.9383C12.8006 0 13.7318 0 14.3103 0.468631C14.8889 0.937262 14.8889 1.6915 14.8889 3.2V12.8Z"
          stroke={color}
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

