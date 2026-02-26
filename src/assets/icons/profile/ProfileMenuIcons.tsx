/**
 * Profile screen menu and action icons from Figma AIRA profile (node 2101-14708).
 * Sources: profile_export Frame-3..9, Ellipse 15, etc.
 */
import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

const ICON_COLOR = '#7742F0';
const SIZE = 20;

export const ProfilePreferencesIcon: React.FC<SvgProps & { color?: string }> = ({
  color = ICON_COLOR,
  width = SIZE,
  height = SIZE,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M14.1665 9.00375C14.1665 8.71567 14.1665 8.57167 14.2098 8.44333C14.3358 8.07037 14.668 7.92563 15.0008 7.77407C15.3748 7.60368 15.5618 7.51849 15.7472 7.5035C15.9576 7.48648 16.1683 7.53182 16.3482 7.63274C16.5866 7.76653 16.7528 8.02078 16.9231 8.22752C17.7093 9.18233 18.1023 9.65983 18.2461 10.1863C18.3622 10.6112 18.3622 11.0555 18.2461 11.4803C18.0363 12.2482 17.3736 12.892 16.883 13.4878C16.6321 13.7926 16.5066 13.945 16.3482 14.0339C16.1683 14.1348 15.9576 14.1802 15.7472 14.1632C15.5618 14.1482 15.3748 14.063 15.0008 13.8926C14.668 13.741 14.3358 13.5963 14.2098 13.2233C14.1665 13.095 14.1665 12.951 14.1665 12.6629V9.00375Z"
      stroke={color}
      strokeWidth="1.25"
    />
    <Path
      d="M5.83317 9.00384C5.83317 8.64117 5.82299 8.31518 5.52976 8.06017C5.42311 7.96742 5.28171 7.90301 4.99893 7.77421C4.62485 7.60382 4.4378 7.51863 4.25247 7.50364C3.69643 7.45867 3.39727 7.83818 3.07661 8.22765C2.29046 9.1825 1.89739 9.65992 1.75355 10.1864C1.63749 10.6113 1.63749 11.0557 1.75355 11.4805C1.96334 12.2484 2.6261 12.8921 3.11668 13.488C3.42591 13.8636 3.72131 14.2063 4.25247 14.1633C4.4378 14.1483 4.62485 14.0631 4.99893 13.8928C5.28171 13.7639 5.42311 13.6995 5.52976 13.6068C5.82299 13.3518 5.83317 13.0258 5.83317 12.6631V9.00384Z"
      stroke={color}
      strokeWidth="1.25"
    />
    <Path
      d="M4.1665 7.5C4.1665 4.73857 6.77818 2.5 9.99984 2.5C13.2215 2.5 15.8332 4.73857 15.8332 7.5"
      stroke={color}
      strokeWidth="1.25"
    />
    <Path
      d="M15.8335 14.166V14.8327C15.8335 16.3054 14.3411 17.4993 12.5002 17.4993H10.8335"
      stroke={color}
      strokeWidth="1.25"
    />
  </Svg>
);

export const ProfileReferralIcon: React.FC<SvgProps & { color?: string }> = ({
  color = ICON_COLOR,
  width = SIZE,
  height = SIZE,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M3.3335 9.16602V12.4993C3.3335 15.2492 3.3335 16.6241 4.18777 17.4784C5.04204 18.3327 6.41697 18.3327 9.16683 18.3327H10.8335C13.5833 18.3327 14.9582 18.3327 15.8126 17.4784C16.6668 16.6241 16.6668 15.2492 16.6668 12.4993V9.16602"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.5 7.50065C2.5 6.87758 2.5 6.56603 2.66747 6.33398C2.77717 6.18197 2.93497 6.05573 3.125 5.96796C3.41507 5.83398 3.80448 5.83398 4.58333 5.83398H15.4167C16.1955 5.83398 16.5849 5.83398 16.875 5.96796C17.065 6.05573 17.2228 6.18197 17.3325 6.33398C17.5 6.56603 17.5 6.87758 17.5 7.50065C17.5 8.12373 17.5 8.43523 17.3325 8.66732C17.2228 8.81932 17.065 8.94557 16.875 9.03332C16.5849 9.16732 16.1955 9.16732 15.4167 9.16732H4.58333C3.80448 9.16732 3.41507 9.16732 3.125 9.03332C2.93497 8.94557 2.77717 8.81932 2.66747 8.66732C2.5 8.43523 2.5 8.12373 2.5 7.50065Z"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 3.15411C5 2.33226 5.66624 1.66602 6.48809 1.66602H6.78572C8.56092 1.66602 10 3.1051 10 4.8803V5.83268H7.67857C6.19923 5.83268 5 4.63344 5 3.15411Z"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 3.15411C15 2.33226 14.3338 1.66602 13.5119 1.66602H13.2142C11.4391 1.66602 10 3.1051 10 4.8803V5.83268H12.3214C13.8007 5.83268 15 4.63344 15 3.15411Z"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 9.16602V18.3327"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileSubscriptionIcon: React.FC<SvgProps & { color?: string }> = ({
  color = ICON_COLOR,
  width = SIZE,
  height = SIZE,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M4.1665 17.084H15.8332"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.0596 14.5827H5.94009C5.08331 14.5827 4.65493 14.5827 4.33003 14.3522C4.00512 14.1217 3.86358 13.7173 3.5805 12.9087L1.7092 7.56325C1.6096 7.26872 1.68736 6.94402 1.91005 6.72448C2.19029 6.44822 2.62938 6.40535 2.95915 6.62207L3.98608 7.297C5.02266 7.97827 5.54096 8.31889 6.06496 8.19508C6.58897 8.07127 6.9 7.53469 7.52205 6.46152L9.3675 3.27778C9.49717 3.05407 9.7385 2.91602 9.99984 2.91602C10.2612 2.91602 10.5025 3.05407 10.6322 3.27778L12.4776 6.46152C13.0997 7.53469 13.4107 8.07127 13.9347 8.19508C14.4588 8.31889 14.977 7.97827 16.0136 7.297L17.0405 6.62207C17.3703 6.40535 17.8094 6.44822 18.0897 6.72448C18.3123 6.94402 18.3901 7.26872 18.2905 7.56325L16.4192 12.9087C16.1361 13.7173 15.9946 14.1217 15.6697 14.3522C15.3448 14.5827 14.9163 14.5827 14.0596 14.5827Z"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileHelpIcon: React.FC<SvgProps & { color?: string }> = ({
  color = ICON_COLOR,
  width = SIZE,
  height = SIZE,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M15.5907 2.91213C14.0137 2.12753 12.0841 1.66602 10 1.66602C7.91592 1.66602 5.98625 2.12753 4.4093 2.91213C3.63598 3.2969 3.24932 3.48928 2.87467 4.09417C2.5 4.69906 2.5 5.28475 2.5 6.45613V9.3636C2.5 14.0998 6.2853 16.733 8.4775 17.8608C9.08892 18.1754 9.39458 18.3327 10 18.3327C10.6054 18.3327 10.9111 18.1754 11.5224 17.8608C13.7147 16.733 17.5 14.0998 17.5 9.3636V6.45613C17.5 5.28476 17.5 4.69907 17.1253 4.09417C16.7507 3.48927 16.364 3.2969 15.5907 2.91213Z"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.5 9.58268C7.5 9.58268 8.67325 9.7926 9.16667 11.2493C9.16667 11.2493 10.4167 8.74935 12.5 7.91602"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfilePrivacyIcon: React.FC<SvgProps & { color?: string }> = ({
  color = ICON_COLOR,
  width = SIZE,
  height = SIZE,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle
      cx="12"
      cy="12"
      r="8.5"
      fill="white"
      stroke={color}
      strokeWidth="1.35"
      strokeDasharray="3 3"
    />
    <Path
      d="M9.2998 12.8036C9.2998 12.8036 10.3798 13.3902 10.9198 14.25C10.9198 14.25 12.5398 10.875 14.6998 9.75"
      stroke={color}
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileChevronRightIcon: React.FC<SvgProps & { color?: string }> = ({
  color = '#999999',
  width = 24,
  height = 24,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileEditPencilIcon: React.FC<SvgProps & { color?: string }> = ({
  color = '#000000',
  width = 16,
  height = 16,
  ...props
}) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M9.11111 4.66667L11.3333 6.88889M3.43434 10.394L3 13L5.60603 12.5657C6.05858 12.4903 6.47625 12.2753 6.80066 11.9509L12.6777 6.07382C13.1074 5.64401 13.1074 4.94717 12.6776 4.51737L11.4826 3.32235C11.0528 2.89254 10.3559 2.89255 9.92606 3.32237L4.04912 9.19944C3.72471 9.52383 3.50976 9.9415 3.43434 10.394Z"
      stroke={color}
      strokeWidth="0.833333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
