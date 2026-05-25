import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

/**
 * Subscription screen background — Figma 4105-14033.
 * Purple abstract shapes with a dark overlay, stretched to fill the device.
 */
const SubScriptionIcon: React.FC = () => {
  const { width, height } = useWindowDimensions();

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 375 812"
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}
    >
      {/* Base fill */}
      <Rect width={375} height={812} fill="#22075F" />

      {/* Top-left lavender sweep */}
      <Path
        d="M0 530V0H529C230.726 96.1868 110.928 210.776 0 530Z"
        fill="#CB7BF5"
      />
      {/* Top-left darker purple */}
      <Path
        d="M0 301V0H300C130.847 54.6269 62.908 119.705 0 301Z"
        fill="#440FBD"
      />

      {/* Bottom-right lavender sweep */}
      <Path
        d="M375 347V812H-89C172.624 727.61 277.702 627.074 375 347Z"
        fill="#CB7BF5"
      />
      {/* Bottom-right darker purple */}
      <Path
        d="M375 498V812H62C238.483 755.014 309.366 687.125 375 498Z"
        fill="#440FBD"
      />

      {/* Dark overlay (replaces Figma backdrop blur) */}
      <Rect width={375} height={812} fill="black" fillOpacity={0.3} />
    </Svg>
  );
};

export default SubScriptionIcon;
