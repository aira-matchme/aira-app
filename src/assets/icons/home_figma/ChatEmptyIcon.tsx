/**
 * Chat empty state illustration – Figma 2101-15370, from Chat.svg
 * Speech bubble with heart outline.
 */
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const STROKE = '#1A1A1A';
const STROKE_WIDTH = 2.57143;
const FILL_DOT = '#CCCCCC';

export type ChatEmptyIconProps = {
  width?: number;
  height?: number;
  strokeColor?: string;
};

export const ChatEmptyIcon: React.FC<ChatEmptyIconProps> = ({
  width = 72,
  height = 72,
  strokeColor = STROKE,
}) => (
  <Svg width={width} height={height} viewBox="0 0 72 72" fill="none">
    <Path
      d="M64.5 36C64.5 51.7401 51.7401 64.5 36 64.5C31.1157 64.5 26.5182 63.2712 22.5 61.1061C16.8953 58.086 13.1239 60.8937 9.79776 61.3974C9.29322 61.4739 8.79072 61.2906 8.42991 60.93C7.88223 60.3822 7.77798 59.5353 8.0805 58.8222C9.38595 55.7454 10.5846 49.9146 8.95023 45C8.0094 42.171 7.5 39.1449 7.5 36C7.5 20.2599 20.2599 7.5 36 7.5C51.7401 7.5 64.5 20.2599 64.5 36Z"
      stroke={strokeColor}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M33.5185 45.6817C30.2539 43.2884 23.7861 37.8167 23.7861 32.8928C23.7861 29.6383 26.2222 27 29.5718 27C31.3076 27 33.0433 27.5672 35.3576 29.8361C37.6718 27.5672 39.4076 27 41.1433 27C44.4929 27 46.929 29.6383 46.929 32.8928C46.929 37.8167 40.4613 43.2884 37.1966 45.6817C36.098 46.4871 34.6171 46.4871 33.5185 45.6817Z"
      stroke={strokeColor}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="62.9999" cy="3.21373" r="1.92857" fill={FILL_DOT} />
    <Circle cx="3.85728" cy="19.9286" r="1.92857" fill={FILL_DOT} />
  </Svg>
);
