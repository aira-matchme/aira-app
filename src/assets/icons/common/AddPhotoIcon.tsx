import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const DEFAULT_STROKE = '#8C8C8C';

type AddPhotoIconProps = SvgProps & { stroke?: string };

const AddPhotoIcon: React.FC<AddPhotoIconProps> = ({ stroke = DEFAULT_STROKE, ...props }) => {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M14 15.5L15.5 17M14 15.5L15.9697 13.5303C16.3092 13.1908 16.7698 13 17.25 13C17.7302 13 18.1908 13.1908 18.5303 13.5303L21 16"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Path
        d="M12 2.5C7.77027 2.5 5.6554 2.5 4.25276 3.69797C4.05358 3.86808 3.86808 4.05358 3.69797 4.25276C2.5 5.6554 2.5 7.77027 2.5 12C2.5 16.2297 2.5 18.3446 3.69797 19.7472C3.86808 19.9464 4.05358 20.1319 4.25276 20.302C5.6554 21.5 7.77027 21.5 12 21.5C16.2297 21.5 18.3446 21.5 19.7472 20.302C19.9464 20.1319 20.1319 19.9464 20.302 19.7472C21.5 18.3446 21.5 16.2297 21.5 12"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Path
        d="M21.5 6H18M18 6H14.5M18 6V2.5M18 6V9.5"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { AddPhotoIcon };
