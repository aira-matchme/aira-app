import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface PlayIconProps {
  size?: number;
  color?: string;
  /** If true, renders circle (lighter purple fill + white stroke) + solid triangle (Figma 1690-5662 voice bubble) */
  variant?: 'default' | 'voiceBubble';
}

/** Play icon – default: outlined triangle; voiceBubble: circle + solid white triangle per Figma 1690-5662 */
export const PlayIcon: React.FC<PlayIconProps> = ({
  size = 20,
  color = '#FFFFFF',
  variant = 'default',
}) => {
  if (variant === 'voiceBubble') {
    // Figma 1690-5662: circle (lighter purple fill + white stroke) + solid white triangle
    const viewSize = 40;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${viewSize} ${viewSize}`}>
        <Circle
          cx={20}
          cy={20}
          r={19}
          fill="#BBA0F8"
          stroke={color}
          strokeWidth={1}
        />
        <Path d="M17 12v16l11-8-11-8z" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M14.9218 10.604C14.6693 11.5633 13.4762 12.2411 11.0898 13.5969C8.78285 14.9075 7.62942 15.5628 6.69988 15.2994C6.31557 15.1905 5.96542 14.9837 5.68303 14.6988C5 14.0096 5 12.673 5 9.99971C5 7.32643 5 5.98979 5.68303 5.30066C5.96542 5.01576 6.31557 4.80892 6.69988 4.70002C7.62942 4.43661 8.78285 5.09191 11.0898 6.40253C13.4762 7.75827 14.6693 8.43614 14.9218 9.39543C15.0261 9.79143 15.0261 10.208 14.9218 10.604Z"
        stroke={color}
        strokeWidth={1.07143}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};
