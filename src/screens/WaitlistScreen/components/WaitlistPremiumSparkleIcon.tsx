import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { scaleWaitlist } from '../layout';

const ICON_SLOT = 40;
const GLOW_BLEED = 18;

/**
 * Figma LOGO Frame — pure SVG (node 3697:14309).
 * Outward glow 0 0 40px #8859F2, white disc, gradient sparkles.
 */
export const WaitlistPremiumSparkleIcon: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();

  const slot = useMemo(() => scaleWaitlist(windowWidth, ICON_SLOT), [windowWidth]);
  const bleed = useMemo(() => scaleWaitlist(windowWidth, GLOW_BLEED), [windowWidth]);
  const canvas = slot + bleed * 2;
  const offset = -bleed;
  const cx = canvas / 2;
  const iconR = slot / 2;
  const glowR = canvas / 2;
  const innerStop = iconR / glowR;

  return (
    <View style={[styles.slot, { width: slot, height: slot }]}>
      <Svg
        width={canvas}
        height={canvas}
        viewBox={`0 0 ${canvas} ${canvas}`}
        style={{ position: 'absolute', left: offset, top: offset }}
      >
        <Defs>
          <RadialGradient
            id="waitlistIconGlow"
            cx={cx}
            cy={cx}
            rx={glowR}
            ry={glowR}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#8859F2" stopOpacity="0" />
            <Stop offset={`${innerStop * 100}%`} stopColor="#8859F2" stopOpacity="0" />
            <Stop offset={`${(innerStop + 0.08) * 100}%`} stopColor="#8859F2" stopOpacity="0.24" />
            <Stop offset={`${(innerStop + 0.2) * 100}%`} stopColor="#8859F2" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#8859F2" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient
            id="waitlistSparkleGrad"
            x1="61.1687"
            y1="50.832"
            x2="61.1687"
            y2="70.832"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#7742F0" />
            <Stop offset="1" stopColor="#CB7BF5" />
          </LinearGradient>
        </Defs>

        <Circle cx={cx} cy={cx} r={glowR} fill="url(#waitlistIconGlow)" />
        <Circle cx={cx} cy={cx} r={iconR} fill="#FFFFFF" />
        <Circle
          cx={cx}
          cy={cx}
          r={iconR + 0.25}
          fill="none"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth={0.5}
        />
        <Path
          d="M63.9403 50.832L64.4966 53.3019C63.9686 55.3968 66.6045 57.0328 68.6995 57.5048L71.1694 58.0611L68.6995 58.6175C66.6045 59.0894 63.9686 60.7253 64.4966 62.8203L63.9403 65.2902L63.384 62.8203C62.912 60.7253 61.2761 59.0894 59.1811 58.6175L56.7112 58.0611L59.1811 57.5048C61.276 57.0328 62.912 55.3968 63.384 53.3019L63.9403 50.832Z"
          fill="url(#waitlistSparkleGrad)"
          transform={`translate(${cx - 61}, ${cx - 61})`}
        />
        <Path
          d="M56.2283 60.7113L55.6178 62.4402C55.9481 63.9066 57.0933 65.0519 59.5598 65.3822L61.2887 65.7717L59.5598 66.1611C57.0933 66.4915 56.9481 67.6366 55.6178 69.1031L55.2283 70.832L55.8389 69.1031C54.5085 67.6366 53.3633 66.4915 52.8969 66.1611L51.168 65.7717L52.8969 65.3822C53.3633 65.0519 55.5085 63.9067 55.8389 62.4402L56.2283 60.7113Z"
          fill="url(#waitlistSparkleGrad)"
          transform={`translate(${cx - 61}, ${cx - 61})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    flexShrink: 0,
    overflow: 'visible',
    alignSelf: 'center',
  },
});
