import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface GradientTextProps {
  children: string;
  style?: { fontSize?: number; fontWeight?: string; fontFamily?: string };
  colors?: [string, string];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

/**
 * Renders text with a linear gradient fill using SVG. Use when MaskedView gradient text fails (e.g. Android).
 * Sizing is approximate; wrap in a View if you need exact layout.
 */
export const GradientText: React.FC<GradientTextProps> = ({
  children,
  style = {},
  colors = ['#CB7BF5', '#7742F0'],
  start = { x: 0, y: 0.5 },
  end = { x: 1, y: 0.5 },
}) => {
  const fontSize = style.fontSize ?? 15;
  const fontWeight = style.fontWeight ?? '500';
  // Approximate width: ~9px per character at 15px font
  const width = Math.min(children.length * 9.5, 220);
  const height = fontSize + 8;
  const gradientId = 'gradientTextGenerating';

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient
            id={gradientId}
            x1={start.x * width}
            y1={start.y * height}
            x2={end.x * width}
            y2={end.y * height}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <SvgText
          x={0}
          y={fontSize + 2}
          fill={`url(#${gradientId})`}
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily={style.fontFamily}
        >
          {children}
        </SvgText>
      </Svg>
    </View>
  );
};
