import React from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { Button } from '../../../components/Button';
import type {
  AuthStackParamList,
  ProfileStackParamList,
} from '../../../navigation/types';

import { styles } from './styles';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const IMG_32 = require('../../../assets/images/referenceIntro/rectangle_32.png');
const IMG_34 = require('../../../assets/images/referenceIntro/rectangle_34.png');
const IMG_35 = require('../../../assets/images/referenceIntro/rectangle_35.png');
const IMG_33 = require('../../../assets/images/referenceIntro/rectangle_33.png');


type NavList = AuthStackParamList & ProfileStackParamList;
type NavProp = NativeStackNavigationProp<NavList, 'ReferenceImageIntro'>;
type RouteProps = RouteProp<NavList, 'ReferenceImageIntro'>;

function GridCard({
  source,
  highlighted,
}: {
  source: ImageSourcePropType;
  highlighted: boolean;
}) {
  return (
    <View
      style={[
        styles.gridCell,
      ]}
    >
      <Image source={source} style={styles.gridImage} resizeMode="cover" />
    </View>
  );
}

export const ReferenceImageIntroScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const returnToProfileMain = route.params?.returnToProfileMain === true;

  const handleStart = () => {
    navigation.navigate('ReferenceImagePreference', {
      returnToProfileMain,
    });
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.gradientBackground}>
        <Svg height="100%" width="100%" style={styles.gradientSvg}>
          <Defs>
            <RadialGradient
              id="grad"
              cx="50%"
              cy="35%"
              rx="70%"
              ry="50%"
              fx="40%"
              fy="32%"
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>
      <SafeAreaView
        style={styles.safeArea}
        edges={['left', 'right', 'top', 'bottom']}
      >
        <View style={styles.content}>
          <View style={styles.gridRow}>
            <GridCard source={IMG_32} highlighted />
            <GridCard source={IMG_33} highlighted={false} />
          </View>
          <View style={styles.gridRow}>
            <GridCard source={IMG_34} highlighted={false} />
            <GridCard source={IMG_35} highlighted />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>
              Now let's see what you're drawn to
            </Text>
            <Text style={styles.subtitle}>
              You'll be shown pairs of photos. Just tap the one that appeals to
              you more — there's no right answer.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Start"
            onPress={handleStart}
            variant="primary"
            style={styles.primaryButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
