import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LikesEmptyIllustrationIconProps {
  size?: number;
  color?: string;
}

/** Empty-state illustration for Likes (Figma / Frame 22). */
export const LikesEmptyIllustrationIcon: React.FC<LikesEmptyIllustrationIconProps> = ({
  size = 72,
  color = '#000000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <Path
      d="M56.998 57.4281C51.5866 62.733 44.1745 66.0039 35.998 66.0039C19.4295 66.0039 5.99805 52.5723 5.99805 36.0039C5.99805 19.4354 19.4295 6.00391 35.998 6.00391C44.3902 6.00391 51.9775 9.44983 57.4222 15.0039"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23.998 45C26.7344 48.6432 31.0909 51 35.998 51C38.1313 51 40.1605 50.5545 41.998 49.7517"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M24.025 27H23.998"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M48.002 38.9961C52.9725 38.9961 57.002 34.9667 57.002 29.9961C57.002 25.0255 52.9725 20.9961 48.002 20.9961C43.0314 20.9961 39.002 25.0255 39.002 29.9961C39.002 34.9667 43.0314 38.9961 48.002 38.9961Z"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M66.002 35.9961C65.3801 34.8084 65.069 34.2147 64.658 33.6945C63.6065 32.3643 62.0372 31.3182 60.1694 30.7023C59.4392 30.4614 58.6268 30.3063 57.002 29.9961"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default LikesEmptyIllustrationIcon;
