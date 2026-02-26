/**
 * Empty matches illustration – Figma 1576-8233, from Container (1).svg
 * Circular container with profile card placeholders.
 */
import React from 'react';
import Svg, { Circle, Rect, G } from 'react-native-svg';
import { colors } from '../../../theme';

const VIEWBOX = { width: 180, height: 180 };
const CIRCLE_CX = 90;
const CIRCLE_CY = 70;
const CIRCLE_R = 60;

// Card placeholder positions from original SVG (x, y, w=40, h=64, rx=4)
const CARD_PLACES: { x: number; y: number }[] = [
  { x: 69.5, y: -29 },
  { x: 69.5, y: 38 },
  { x: 69.5, y: 105 },
  { x: 113.5, y: 4 },
  { x: 113.5, y: 71 },
  { x: 25.5, y: 4 },
  { x: 25.5, y: 71 },
];

const CARD_W = 40;
const CARD_H = 64;
const CARD_RX = 4;

export type MatchEmptyIllustrationProps = {
  width?: number;
  height?: number;
};

export const MatchEmptyIllustration = ({
  width = 180,
  height = 180,
}: MatchEmptyIllustrationProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      fill="none"
    >
      <G>
        {/* Main circular container (white) */}
        <Circle
          cx={CIRCLE_CX}
          cy={CIRCLE_CY}
          r={CIRCLE_R}
          fill={colors.white}
        />
        {/* Card placeholders */}
        {CARD_PLACES.map((pos, i) => (
          <Rect
            key={i}
            x={pos.x}
            y={pos.y}
            width={CARD_W}
            height={CARD_H}
            rx={CARD_RX}
            fill={colors.neutral[100]}
            stroke={colors.neutral[200]}
            strokeWidth={0.5}
          />
        ))}
      </G>
    </Svg>
  );
};
