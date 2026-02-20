import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface AskAiraIconProps {
  size?: number;
  /** Icon color. Set useGradient=true for design gradient (lavender to violet). */
  color?: string;
  useGradient?: boolean;
}

/** Sparkle icon for "Ask AIRA" chip – Figma 1690-6128, from Action/_Input-action/Frame.svg */
export const AskAiraIcon: React.FC<AskAiraIconProps> = ({
  size = 18,
  color = '#FFFFFF',
  useGradient = false,
}) => {
  const viewBox = '0 0 18 18';
  const path1 =
    'M7.5 5.25L7.11311 6.29554C6.6058 7.6665 6.35215 8.352 5.85208 8.8521C5.35202 9.35212 4.66653 9.60577 3.29554 10.1131L2.25 10.5L3.29554 10.8868C4.66653 11.3942 5.35202 11.6479 5.85208 12.1479C6.35215 12.648 6.6058 13.3335 7.11311 14.7044L7.5 15.75L7.88685 14.7044C8.39423 13.3335 8.64787 12.648 9.1479 12.1479C9.648 11.6479 10.3335 11.3942 11.7044 10.8868L12.75 10.5L11.7044 10.1131C10.3335 9.60577 9.648 9.35212 9.1479 8.8521C8.64787 8.352 8.39423 7.6665 7.88685 6.29554L7.5 5.25Z';
  const path2 =
    'M13.5 2.25L13.3342 2.69809C13.1168 3.28565 13.0081 3.57944 12.7937 3.79375C12.5795 4.00806 12.2857 4.11677 11.6981 4.33419L11.25 4.5L11.6981 4.66581C12.2857 4.88323 12.5795 4.99194 12.7937 5.20625C13.0081 5.42056 13.1168 5.71435 13.3342 6.30191L13.5 6.75L13.6658 6.30191C13.8832 5.71435 13.9919 5.42056 14.2063 5.20624C14.4205 4.99194 14.7143 4.88323 15.3019 4.66581L15.75 4.5L15.3019 4.33419C14.7143 4.11677 14.4205 4.00806 14.2063 3.79375C13.9919 3.57944 13.8832 3.28565 13.6658 2.69809L13.5 2.25Z';

  if (useGradient) {
    return (
      <Svg width={size} height={size} viewBox={viewBox} fill="none">
        <Defs>
          <LinearGradient
            id="askAiraGrad1"
            x1="2.25"
            y1="5.25"
            x2="10.6008"
            y2="3.75388"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#CB7BF5" />
            <Stop offset={1} stopColor="#7742F0" />
          </LinearGradient>
          <LinearGradient
            id="askAiraGrad2"
            x1="11.25"
            y1="2.25"
            x2="14.8289"
            y2="1.60881"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#CB7BF5" />
            <Stop offset={1} stopColor="#7742F0" />
          </LinearGradient>
        </Defs>
        <Path fill="url(#askAiraGrad1)" d={path1} />
        <Path fill="url(#askAiraGrad2)" d={path2} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox={viewBox} fill="none">
      <Path fill={color} d={path1} />
      <Path fill={color} d={path2} />
    </Svg>
  );
};
