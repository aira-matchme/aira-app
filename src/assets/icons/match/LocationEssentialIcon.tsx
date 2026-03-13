import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

// Icon derived from "Frame (15).svg" for location essential row
export const LocationEssentialIcon: React.FC<Props> = ({
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
        <ClipPath id="location_essential_clip">
          <Rect width={20} height={20} fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#location_essential_clip)">
        <Path
          d="M12.7998 7.2C12.7998 8.7464 11.5462 10 9.9998 10C8.4534 10 7.1998 8.7464 7.1998 7.2C7.1998 5.6536 8.4534 4.4 9.9998 4.4C11.5462 4.4 12.7998 5.6536 12.7998 7.2Z"
          stroke={color}
        />
        <Path
          d="M9.9998 0C13.8963 0 17.1998 3.22638 17.1998 7.14064C17.1998 11.1172 13.8424 13.9078 10.7414 15.8054C10.5154 15.933 10.2598 16 9.9998 16C9.7398 16 9.4842 15.933 9.2582 15.8054C6.16292 13.8893 2.7998 11.131 2.7998 7.14064C2.7998 3.22638 6.10336 0 9.9998 0Z"
          stroke={color}
        />
      </G>
    </Svg>
  );
};

