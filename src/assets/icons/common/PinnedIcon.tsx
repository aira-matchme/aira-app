import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PinnedIconProps {
  size?: number;
  color?: string;
}

// From Frame (7).svg - pushpin outline
export const PinnedIcon: React.FC<PinnedIconProps> = ({
  size = 20,
  color = '#000000',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M2.5 17.4997L6.66667 13.333"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.0487 15.7262C7.9293 15.0179 4.98203 12.0707 4.27377 8.95125C4.16166 8.45742 4.1056 8.21055 4.26801 7.80998C4.43041 7.40941 4.62881 7.28546 5.02559 7.03758C5.92254 6.47721 6.89378 6.29907 7.90174 6.38822C9.31608 6.51332 10.0232 6.57587 10.376 6.39207C10.7288 6.20826 10.9685 5.77848 11.448 4.91891L12.0553 3.83003C12.4554 3.11273 12.6555 2.75408 13.1261 2.58502C13.5967 2.41594 13.8798 2.51833 14.4462 2.72309C15.7707 3.20197 16.798 4.22921 17.2769 5.55374C17.4817 6.12014 17.5841 6.40334 17.415 6.87392C17.2459 7.3445 16.8872 7.54455 16.1699 7.94465L15.056 8.566C14.198 9.0445 13.7691 9.28383 13.5853 9.64C13.4016 9.99625 13.4683 10.688 13.6017 12.0716C13.6999 13.089 13.5307 14.0667 12.9629 14.9748C12.7147 15.3715 12.5907 15.5699 12.1902 15.7322C11.7897 15.8944 11.5427 15.8383 11.0487 15.7262Z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
