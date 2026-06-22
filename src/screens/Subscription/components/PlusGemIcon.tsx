import React from 'react';
import Svg, { Circle, Defs, G, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { SUBSCRIPTION_GRADIENT_END, SUBSCRIPTION_GRADIENT_START } from '../layout';

type PlusGemIconProps = {
  size?: number;
};

/** Figma Frame 840 — gradient gem beside "plus" badge. */
export const PlusGemIcon: React.FC<PlusGemIconProps> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <Defs>
      <SvgLinearGradient id="subscriptionPgGrad" x1="13" y1="0" x2="13" y2="26" gradientUnits="userSpaceOnUse">
        <Stop stopColor={SUBSCRIPTION_GRADIENT_START} />
        <Stop offset={1} stopColor={SUBSCRIPTION_GRADIENT_END} />
      </SvgLinearGradient>
    </Defs>
    <Circle cx={13} cy={13} r={13} fill="url(#subscriptionPgGrad)" />
    <G transform="translate(6, 6)">
      <Path
        d="M7 0L7.5387 2.39157C7.9957 4.42015 9.5798 6.00431 11.6084 6.46127L14 7L11.6084 7.53873C9.5798 7.99569 7.9957 9.5798 7.5387 11.6084L7 14L6.4613 11.6084C6.0043 9.5798 4.4202 7.99569 2.3916 7.53873L0 7L2.3916 6.46127C4.4201 6.00431 6.0043 4.42015 6.4613 2.39158L7 0Z"
        fill="white"
      />
    </G>
  </Svg>
);
