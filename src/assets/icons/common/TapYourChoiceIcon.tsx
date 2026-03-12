import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface TapYourChoiceIconProps {
  size?: number;
  circleFill?: string;
  strokeColor?: string;
}

/**
 * From Figma Frame 736.svg – hand/tap prompt for "Tap your choice".
 */
export const TapYourChoiceIcon: React.FC<TapYourChoiceIconProps> = ({
  size = 24,
  circleFill = '#F2F2F2',
  strokeColor = '#404040',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect width="24" height="24" rx="12" fill={circleFill} />
      <Path
        d="M8.6577 8.01815C8.61376 7.40445 8.99176 6.19038 10.029 5.68274C10.4567 5.42291 11.6307 5.02061 12.7536 5.73745C13.8602 6.44391 13.9349 7.4855 14.0045 8.01125"
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.444 18.668C15.4138 17.5773 15.4826 17.4693 15.5623 17.2266C15.6421 16.984 16.1999 16.109 16.3972 15.4839C17.0357 13.4613 16.4406 13.0311 15.6472 12.4575C14.7674 11.8214 13.1843 11.5055 12.3613 11.5753V8.34937C12.3613 7.80042 11.8351 7.35156 11.2733 7.35156C10.7114 7.35156 10.1949 7.80042 10.1949 8.34937V13.8906L9.04868 12.8967C8.67563 12.5013 8.07612 12.4613 7.66695 12.8209C7.27921 13.1617 7.22262 13.7356 7.53666 14.1424L8.2904 15.119M8.2904 15.119C8.45271 15.3249 8.6344 15.5583 8.8409 15.8321M8.2904 15.119L8.8409 15.8321M8.2904 15.119C7.95715 14.6961 7.70559 14.3888 7.48872 14.0835M10.1634 18.668V18.0992C10.1885 17.3973 9.66588 16.9393 8.98432 16.0236C8.93522 15.9576 8.88743 15.8939 8.8409 15.8321M8.8409 15.8321L9.52296 16.7158"
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
