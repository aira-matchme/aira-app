import React from 'react';
import Svg, {
  Path,
  Defs,
  Mask,
  G,
  RadialGradient,
  Stop,
  LinearGradient,
} from 'react-native-svg';

interface GoogleIconProps {
  size?: number;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({ size = 18 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Defs>
        <Mask id="mask0_315_93" maskUnits="userSpaceOnUse" x="0" y="0" width="18" height="18">
          <Path
            d="M17.8271 7.33029H9.19172V10.7905H14.1537C14.0739 11.2802 13.8948 11.7619 13.6325 12.2012C13.332 12.7045 12.9605 13.0876 12.5797 13.3794C11.4391 14.2535 10.1092 14.4322 9.18569 14.4322C6.85268 14.4322 4.85927 12.9243 4.08759 10.8754C4.05644 10.8011 4.03576 10.7243 4.01058 10.6484C3.84006 10.1269 3.74688 9.5746 3.74688 9.00057C3.74688 8.40317 3.84778 7.8313 4.03175 7.2912C4.75739 5.16106 6.79574 3.57005 9.18737 3.57005C9.66842 3.57005 10.1317 3.62731 10.571 3.74152C11.5749 4.00253 12.2851 4.51659 12.7203 4.92321L15.3459 2.35182C13.7488 0.887375 11.6667 2.21413e-09 9.18301 2.21413e-09C7.19749 -4.27344e-05 5.36438 0.618586 3.8622 1.66409C2.64398 2.51196 1.64487 3.64716 0.970594 4.96557C0.343418 6.188 0 7.54268 0 8.99922C0 10.4558 0.343943 11.8246 0.971121 13.0357V13.0439C1.63357 14.3297 2.60231 15.4367 3.7797 16.2807C4.80828 17.018 6.65263 18 9.18301 18C10.6382 18 11.9278 17.7376 13.0652 17.246C13.8857 16.8913 14.6126 16.4287 15.2708 15.8341C16.1405 15.0485 16.8216 14.0768 17.2864 12.9589C17.7513 11.8409 18 10.5766 18 9.206C18 8.56767 17.9359 7.91941 17.8271 7.33022V7.33029Z"
            fill="white"
          />
        </Mask>
        <RadialGradient
          id="paint0_radial_315_93"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-0.374041 -8.96393 13.4483 -0.537918 6.7733 15.2713)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.141612" stopColor="#1ABD4D" />
          <Stop offset="0.247515" stopColor="#6EC30D" />
          <Stop offset="0.311547" stopColor="#8AC502" />
          <Stop offset="0.366013" stopColor="#A2C600" />
          <Stop offset="0.445673" stopColor="#C8C903" />
          <Stop offset="0.540305" stopColor="#EBCB03" />
          <Stop offset="0.615636" stopColor="#F7CD07" />
          <Stop offset="0.699345" stopColor="#FDCD04" />
          <Stop offset="0.771242" stopColor="#FDCE05" />
          <Stop offset="0.860566" stopColor="#FFCE0A" />
        </RadialGradient>
        <RadialGradient
          id="paint1_radial_315_93"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(6.35225 -1.52668e-05 -8.92835e-06 8.03195 15.1612 4.79817)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.408458" stopColor="#FB4E5A" />
          <Stop offset="1" stopColor="#FF4540" />
        </RadialGradient>
        <RadialGradient
          id="paint2_radial_315_93"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-8.89996 4.82619 6.68907 11.8245 11.6922 -1.23956)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.231273" stopColor="#FF4541" />
          <Stop offset="0.311547" stopColor="#FF4540" />
          <Stop offset="0.457516" stopColor="#FF4640" />
          <Stop offset="0.540305" stopColor="#FF473F" />
          <Stop offset="0.699346" stopColor="#FF5138" />
          <Stop offset="0.771242" stopColor="#FF5B33" />
          <Stop offset="0.860566" stopColor="#FF6C29" />
          <Stop offset="1" stopColor="#FF8C18" />
        </RadialGradient>
        <RadialGradient
          id="paint3_radial_315_93"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-16.1403 -20.6285 -7.77723 5.83314 9.3241 16.9527)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.131546" stopColor="#0CBA65" />
          <Stop offset="0.209784" stopColor="#0BB86D" />
          <Stop offset="0.297297" stopColor="#09B479" />
          <Stop offset="0.396257" stopColor="#08AD93" />
          <Stop offset="0.477124" stopColor="#0AA6A9" />
          <Stop offset="0.568425" stopColor="#0D9CC6" />
          <Stop offset="0.667385" stopColor="#1893DD" />
          <Stop offset="0.768727" stopColor="#258BF1" />
          <Stop offset="0.858506" stopColor="#3086FF" />
        </RadialGradient>
        <RadialGradient
          id="paint4_radial_315_93"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-1.14221 9.63913 13.6126 1.54626 8.40304 1.62314)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.366013" stopColor="#FF4E3A" />
          <Stop offset="0.457516" stopColor="#FF8A1B" />
          <Stop offset="0.540305" stopColor="#FFA312" />
          <Stop offset="0.615636" stopColor="#FFB60C" />
          <Stop offset="0.771242" stopColor="#FFCD0A" />
          <Stop offset="0.860566" stopColor="#FECF0A" />
          <Stop offset="0.915033" stopColor="#FECF08" />
          <Stop offset="1" stopColor="#FDCD01" />
        </RadialGradient>
        <RadialGradient
          id="paint5_radial_315_93"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-3.30159 3.57508 -10.2992 -9.11745 6.79677 1.52307)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.315904" stopColor="#FF4C3C" />
          <Stop offset="0.603818" stopColor="#FF692C" />
          <Stop offset="0.726837" stopColor="#FF7825" />
          <Stop offset="0.884534" stopColor="#FF8D1B" />
          <Stop offset="1" stopColor="#FF9F13" />
        </RadialGradient>
        <RadialGradient
          id="paint6_radial_315_93"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-8.89996 -4.82619 6.68907 -11.8245 11.6922 19.2394)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.231273" stopColor="#0FBC5F" />
          <Stop offset="0.311547" stopColor="#0FBC5F" />
          <Stop offset="0.366013" stopColor="#0FBC5E" />
          <Stop offset="0.457516" stopColor="#0FBC5D" />
          <Stop offset="0.540305" stopColor="#12BC58" />
          <Stop offset="0.699346" stopColor="#28BF3C" />
          <Stop offset="0.771242" stopColor="#38C02B" />
          <Stop offset="0.860566" stopColor="#52C218" />
          <Stop offset="0.915033" stopColor="#67C30F" />
          <Stop offset="1" stopColor="#86C504" />
        </RadialGradient>
        <LinearGradient
          id="paint7_linear_315_93"
          x1="8.07404"
          y1="16.1558"
          x2="10.3096"
          y2="16.1558"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#0FBC5C" />
          <Stop offset="1" stopColor="#0CBA65" />
        </LinearGradient>
      </Defs>
      <G mask="url(#mask0_315_93)">
        <Path
          d="M-0.132446 9.06042C-0.122901 10.494 0.285604 11.9732 0.903944 13.1672V13.1755C1.35072 14.0426 1.96135 14.7276 2.65683 15.4063L6.85739 13.8736C6.06267 13.4699 5.9414 13.2226 5.37172 12.7712C4.78955 12.1842 4.35566 11.5102 4.08544 10.72H4.07456L4.08544 10.7118C3.90767 10.19 3.89014 9.63607 3.88358 9.06042H-0.132446Z"
          fill="url(#paint0_radial_315_93)"
        />
        <Path
          d="M9.1918 -0.0654297C8.77662 1.39317 8.93537 2.81097 9.1918 3.63591C9.67124 3.63626 10.1331 3.69341 10.571 3.80727C11.575 4.06828 12.2851 4.58236 12.7202 4.98898L15.4132 2.35189C13.8179 0.889194 11.898 -0.0631251 9.1918 -0.0654297Z"
          fill="url(#paint1_radial_315_93)"
        />
        <Path
          d="M9.1828 -0.0769043C7.14632 -0.0769483 5.26615 0.557562 3.72541 1.62991C3.15334 2.02807 2.62835 2.48801 2.16089 2.99948C2.03843 4.14838 3.07763 5.56049 5.13557 5.5488C6.13407 4.38732 7.61084 3.63584 9.25448 3.63584C9.25598 3.63584 9.25744 3.63596 9.25894 3.63597L9.19181 -0.0766415C9.18878 -0.0766434 9.18584 -0.0769043 9.1828 -0.0769043Z"
          fill="url(#paint2_radial_315_93)"
        />
        <Path
          d="M15.9043 9.4761L14.0866 10.7248C14.0069 11.2145 13.8276 11.6963 13.5653 12.1355C13.2648 12.6388 12.8934 13.022 12.5126 13.3138C11.3743 14.186 10.048 14.3656 9.12466 14.3663C8.17033 15.9918 8.00302 16.8059 9.19179 18.1177C10.6628 18.1167 11.9669 17.8511 13.1171 17.3539C13.9486 16.9944 14.6853 16.5256 15.3523 15.9231C16.2336 15.127 16.924 14.1422 17.3951 13.0092C17.8662 11.8762 18.1181 10.5951 18.1181 9.20605L15.9043 9.4761Z"
          fill="url(#paint3_radial_315_93)"
        />
        <Path
          d="M9.05756 7.19885V10.922H17.803C17.8799 10.4121 18.1343 9.75228 18.1343 9.20605C18.1343 8.56772 18.0702 7.78804 17.9615 7.19885H9.05756Z"
          fill="#3086FF"
        />
        <Path
          d="M2.20259 2.86804C1.66291 3.45853 1.20185 4.11945 0.836291 4.83423C0.209125 6.05666 -0.134277 7.54279 -0.134277 8.99933C-0.134277 9.01986 -0.132579 9.03994 -0.132442 9.06043C0.145311 9.59299 3.7042 9.49101 3.88359 9.06043C3.88336 9.04034 3.8811 9.02075 3.8811 9.00062C3.8811 8.40321 3.98203 7.96288 4.16599 7.42278C4.39294 6.75657 4.74829 6.14309 5.20268 5.61452C5.30569 5.48301 5.58044 5.2003 5.6606 5.03073C5.69113 4.96614 5.60516 4.92988 5.60035 4.90715C5.59498 4.88172 5.47971 4.90217 5.45389 4.88323C5.3719 4.82309 5.20953 4.79168 5.11094 4.76377C4.90021 4.7041 4.55097 4.57252 4.35699 4.43611C3.74383 4.00495 2.78694 3.48994 2.20259 2.86804Z"
          fill="url(#paint4_radial_315_93)"
        />
        <Path
          d="M4.37014 4.90961C5.792 5.77091 6.20089 4.47487 7.14623 4.06931L5.50179 0.65918C4.89687 0.913425 4.32535 1.2293 3.79506 1.59838C3.00312 2.14956 2.30378 2.82217 1.72607 3.5876L4.37014 4.90961Z"
          fill="url(#paint5_radial_315_93)"
        />
        <Path
          d="M4.94889 13.6101C3.04023 14.2991 2.74143 14.3238 2.56573 15.5067C2.90147 15.8343 3.2622 16.1374 3.64552 16.4122C4.6741 17.1495 6.65265 18.1314 9.18303 18.1314C9.186 18.1314 9.18884 18.1312 9.19181 18.1312V14.3006C9.1899 14.3006 9.1877 14.3007 9.18578 14.3007C8.23824 14.3007 7.48107 14.0519 6.70472 13.6191C6.51331 13.5124 6.16604 13.7989 5.9895 13.6708C5.74602 13.4941 5.16007 13.823 4.94889 13.6101Z"
          fill="url(#paint6_radial_315_93)"
        />
        <G opacity="0.5">
          <Path
            d="M8.07404 14.1801V18.0649C8.42808 18.1064 8.79653 18.1316 9.18306 18.1316C9.57053 18.1316 9.94539 18.1117 10.3096 18.0751V14.2062C9.90145 14.276 9.51699 14.3008 9.18581 14.3008C8.80438 14.3008 8.43345 14.2564 8.07404 14.1801Z"
            fill="url(#paint7_linear_315_93)"
          />
        </G>
      </G>
    </Svg>
  );
};

