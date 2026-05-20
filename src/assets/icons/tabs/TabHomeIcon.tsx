import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

type TabHomeIconProps = SvgProps & { color?: string };

const homePath =
  'M22 10.499L12.8825 2.82109C12.6355 2.61309 12.3229 2.49902 12 2.49902C11.6771 2.49902 11.3645 2.61309 11.1175 2.82109L2 10.499';
const homePath2 =
  'M20.5 9.50098V16.001C20.5 18.3466 20.5 19.5194 19.8801 20.3273C19.7205 20.5353 19.5343 20.7215 19.3263 20.8811C18.5184 21.501 17.3456 21.501 15 21.501V17.001C15 15.5868 15 14.8797 14.5607 14.4403C14.1213 14.001 13.4142 14.001 12 14.001C10.5858 14.001 9.87868 14.001 9.43934 14.4403C9 14.8797 9 15.5868 9 17.001V21.501C6.65442 21.501 5.48164 21.501 4.67372 20.8811C4.46572 20.7215 4.27954 20.5353 4.11994 20.3273C3.5 19.5194 3.5 18.3466 3.5 16.001V9.50098';

export const TabHomeIcon: React.FC<TabHomeIconProps> = ({
  color = '#8C8C8C',
  width = 24,
  height = 24,
  ...props
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d={homePath} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={homePath2} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};
