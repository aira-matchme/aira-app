import React from 'react';
import Svg, {
  Defs,
  FeBlend,
  FeColorMatrix,
  FeComposite,
  FeFlood,
  FeGaussianBlur,
  FeOffset,
  Filter,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

interface AskAiraIconProps {
  size?: number;
}

export const AskAiraIcon: React.FC<AskAiraIconProps> = ({ size = 56 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <Defs>
        <Filter
          id="filter0_i_4056_15435"
          x="0"
          y="0"
          width="56"
          height="56"
          filterUnits="userSpaceOnUse"
        >
          <FeFlood floodOpacity={0} result="BackgroundImageFix" />
          <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <FeOffset />
          <FeGaussianBlur stdDeviation={5} />
          <FeComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 0.467961 0 0 0 0 0.258252 0 0 0 0 0.941748 0 0 0 0.4 0"
          />
          <FeBlend mode="normal" in2="shape" result="effect1_innerShadow_4056_15435" />
        </Filter>
        <LinearGradient
          id="paint0_linear_4056_15435"
          x1="27.1482"
          y1="16"
          x2="27.1482"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#7742F0" />
          <Stop offset={1} stopColor="#CB7BF5" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_4056_15435"
          x1="27.1482"
          y1="16"
          x2="27.1482"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#7742F0" />
          <Stop offset={1} stopColor="#CB7BF5" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_4056_15435"
          x1="27.1482"
          y1="16"
          x2="27.1482"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#7742F0" />
          <Stop offset={1} stopColor="#CB7BF5" />
        </LinearGradient>
      </Defs>
      <G filter="url(#filter0_i_4056_15435)">
        <Rect width={56} height={56} rx={28} fill="white" />
        <Path
          d="M21.8432 38C20.9365 38 20.1131 37.8189 19.373 37.4568C18.6421 37.0947 18.0639 36.571 17.6384 35.8859C17.2128 35.191 17 34.3493 17 33.3608C17 31.697 17.5875 30.4344 18.7624 29.5731C19.9374 28.702 21.7923 28.2518 24.3272 28.2224L26.1312 28.1931V27.2829C26.1312 26.588 25.937 26.0545 25.5484 25.6826C25.1691 25.3009 24.5724 25.115 23.7582 25.1248C23.1754 25.1345 22.6157 25.2813 22.0791 25.5652C21.5517 25.849 21.1863 26.3433 20.9828 27.048H17.6106C17.6661 25.9518 17.9668 25.0513 18.5126 24.3467C19.0677 23.6322 19.8125 23.1037 20.7469 22.7611C21.6813 22.4088 22.7498 22.2326 23.9525 22.2326C25.4142 22.2326 26.5892 22.4283 27.4773 22.8198C28.3655 23.2015 29.0084 23.7545 29.4063 24.4788C29.8133 25.1933 30.0169 26.0448 30.0169 27.0333V37.7064H26.6308L26.2978 35.0932C25.8074 36.1893 25.1922 36.9479 24.4521 37.3687C23.7212 37.7896 22.8516 38 21.8432 38ZM23.217 35.1812C23.5778 35.1812 23.9294 35.1127 24.2717 34.9757C24.6232 34.8289 24.9378 34.638 25.2153 34.4032C25.4929 34.1585 25.7103 33.8844 25.8676 33.581C26.0341 33.2776 26.122 32.9644 26.1312 32.6414V30.3952L24.6741 30.4246C23.9988 30.4344 23.3697 30.5225 22.7868 30.6889C22.204 30.8455 21.7321 31.1048 21.3713 31.467C21.0198 31.8291 20.844 32.3184 20.844 32.935C20.844 33.6397 21.0707 34.1927 21.524 34.594C21.9866 34.9855 22.5509 35.1812 23.217 35.1812Z"
          fill="url(#paint0_linear_4056_15435)"
        />
        <Path
          d="M32.2346 37.7064V22.5262H36.1064V37.7064H32.2346Z"
          fill="url(#paint1_linear_4056_15435)"
        />
        <Path
          d="M37.2965 17.4061C37.2965 16.6296 36.6151 16 35.775 16C35.1465 16 34.607 16.3518 34.3749 16.8539C34.1428 16.3518 33.6033 16 32.9752 16C32.1344 16 31.4534 16.6296 31.4534 17.4061C31.4534 19.662 34.3749 21.1556 34.3749 21.1556C34.3749 21.1556 37.2965 19.662 37.2965 17.4061Z"
          fill="url(#paint2_linear_4056_15435)"
        />
      </G>
    </Svg>
  );
};
