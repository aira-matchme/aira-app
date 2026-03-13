import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

// Icon derived from Frame 513.svg for gender essential row
export const GenderEssentialIcon: React.FC<Props> = ({
  size = 20,
  color = '#BBA0F8',
}) => {
  // Original viewBox is 0 0 20 21, so we keep that and scale via size
  const width = size;
  const height = (21 / 20) * size;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 21"
      fill="none"
    >
      <Path
        d="M9 11.2998C11.2091 11.2998 13 9.55374 13 7.39984C13 5.24593 11.2091 3.49984 9 3.49984C6.79086 3.49984 5 5.24593 5 7.39984C5 9.55374 6.79086 11.2998 9 11.2998ZM9 11.2998V16.4998M7 14.5498H11M16 3.7V2.63333C16 1.62768 16 1.12485 15.6876 0.812427C15.3752 0.5 14.8723 0.5 13.8667 0.5H12.8M15.4667 1.03333L12 4.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

