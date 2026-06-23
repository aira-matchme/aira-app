import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
} from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LogoWordmark } from '../../assets/icons/branding/LogoWordmark';
import { CloseIcon } from '../../assets/icons/common/CloseIcon';
import { useIAP } from '../../hooks/useIAP';
import { useSubscriptionEntitlements } from '../../hooks/useSubscriptionEntitlements';
import { useAuthStore } from '../../store/auth.store';
import { useSubscriptionStore } from '../../store/subscription.store';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import {
  SUBSCRIPTION_BOTTOM_PANEL_HEIGHT,
  SUBSCRIPTION_BOTTOM_PANEL_PAD_BOTTOM,
  SUBSCRIPTION_FEATURE_ICON_INNER,
  SUBSCRIPTION_GRADIENT_END,
  SUBSCRIPTION_GRADIENT_START,
  SUBSCRIPTION_LOGO_HEIGHT,
  SUBSCRIPTION_LOGO_WIDTH,
  SUBSCRIPTION_PRICE_GRADIENT_BOTTOM,
  SUBSCRIPTION_PRICE_GRADIENT_TOP,
  SUBSCRIPTION_PRICE_PILL_OVERLAP,
  scaleSubscription,
} from './layout';
import { styles } from './styles';
import { SubscriptionBackground } from './SubscriptionBackground';
import { PlusGemIcon } from './components/PlusGemIcon';
import { ManageSubscriptionView } from './ManageSubscriptionView';
import { formatSubscriptionAmountGBP } from '../../modules/iap/entitlements';

const IntroductionsIcon: React.FC = () => (
  <Svg
    width={SUBSCRIPTION_FEATURE_ICON_INNER}
    height={SUBSCRIPTION_FEATURE_ICON_INNER}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      d="M1.33398 4.66634H3.244C3.72848 4.66634 4.1931 4.42655 4.53568 3.99971C5.02494 3.39011 5.74862 3.17725 6.40502 3.44987L7.33398 3.83569M1.33398 10.6442H2.41444C3.18743 10.6442 3.57392 10.6442 3.9394 10.7472C3.95716 10.7522 3.97488 10.7574 3.99253 10.7627C4.35571 10.8731 4.67729 11.0803 5.32046 11.4948C6.57918 12.306 7.20867 12.7117 7.89445 12.6623C7.92678 12.66 7.95905 12.6569 7.99125 12.6531C8.67372 12.5715 9.20858 12.0544 10.2784 11.0202L11.334 9.99967M14.6673 4.82224H12.9895C12.2789 4.82224 11.7773 4.43613 11.2675 3.9214C10.9374 3.58799 10.5161 3.39149 10.0732 3.36443C9.57799 3.33418 9.00419 3.29158 8.52332 3.42368C7.98805 3.57072 7.63465 3.97343 7.26079 4.39432L6.29605 5.48042C5.90219 5.92382 5.90219 6.64271 6.29605 7.08614C6.63599 7.46881 7.16859 7.52821 7.56859 7.22794C7.85645 7.01194 8.18352 6.66305 8.52272 6.55318C8.90445 6.42952 9.14125 6.70734 9.35759 6.99961L10.905 9.09008C11.4787 9.86501 11.7656 10.2526 12.1579 10.4594C12.5503 10.6663 12.9986 10.6663 13.8953 10.6663H14.6673"
      stroke="white"
      strokeLinecap="round"
    />
  </Svg>
);

const MessagingIcon: React.FC = () => (
  <Svg
    width={SUBSCRIPTION_FEATURE_ICON_INNER}
    height={SUBSCRIPTION_FEATURE_ICON_INNER}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Defs>
      <ClipPath id="subscriptionMsgClip">
        <Rect width={16} height={16} fill="white" />
      </ClipPath>
    </Defs>
    <G clipPath="url(#subscriptionMsgClip)">
      <Path
        d="M8.08736 7.65059H7.99986M10.8875 7.65059H10.8M5.2875 7.65059H5.2M8 13.9506C12.993 13.9506 15 11.13 15 7.65059C15 4.17119 13.693 1.35059 8 1.35059C2.49297 1.35059 1 4.17119 1 7.65059C1 9.10043 1.25924 10.436 1.96013 11.5006C2.84297 12.9006 2.39477 14.1839 1.7 14.6506C2.83083 14.6506 3.59148 14.2906 4.07467 13.9342C4.41776 13.6811 4.85482 13.5561 5.26888 13.6576C6.04482 13.8479 6.94937 13.9506 8 13.9506ZM8.17486 7.65059C8.17486 7.74726 8.09653 7.82559 7.99986 7.82559C7.90326 7.82559 7.82486 7.74726 7.82486 7.65059C7.82486 7.55392 7.90326 7.47559 7.99986 7.47559C8.09653 7.47559 8.17486 7.55392 8.17486 7.65059ZM10.975 7.65059C10.975 7.74726 10.8967 7.82559 10.8 7.82559C10.7033 7.82559 10.625 7.74726 10.625 7.65059C10.625 7.55392 10.7033 7.47559 10.8 7.47559C10.8967 7.47559 10.975 7.55392 10.975 7.65059ZM5.375 7.65059C5.375 7.74726 5.29665 7.82559 5.2 7.82559C5.10335 7.82559 5.025 7.74726 5.025 7.65059C5.025 7.55392 5.10335 7.47559 5.2 7.47559C5.29665 7.47559 5.375 7.55392 5.375 7.65059Z"
        stroke="white"
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

const AIAssistIcon: React.FC = () => (
  <Svg
    width={SUBSCRIPTION_FEATURE_ICON_INNER}
    height={SUBSCRIPTION_FEATURE_ICON_INNER}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      d="M7.90113 7.00033L2.41942 12.4821C2.22424 12.6772 2.12663 12.7748 2.07446 12.8801C1.97518 13.0805 1.97518 13.3157 2.07446 13.5161C2.1266 13.6212 2.22455 13.7192 2.41949 13.9142C2.61471 14.1094 2.71233 14.207 2.81763 14.2592C3.01797 14.3585 3.2532 14.3585 3.45355 14.2592C3.55885 14.207 3.65647 14.1094 3.85169 13.9142L9.33333 8.43253L10.9139 6.85199C11.1091 6.65679 11.2067 6.55917 11.2589 6.45387C11.3581 6.25353 11.3581 6.0183 11.2589 5.81795C11.2067 5.71265 11.1091 5.61504 10.9139 5.41981C10.7188 5.22479 10.6209 5.12694 10.5157 5.07479C10.3153 4.97551 10.0801 4.97551 9.8798 5.07479C9.77447 5.12697 9.67687 5.22458 9.48167 5.41981L7.90113 7.00033ZM9.33333 8.43253L7.90113 7.00033M13 1.66699L12.9263 1.86615C12.8297 2.12729 12.7813 2.25785 12.6861 2.35311C12.5909 2.44835 12.4603 2.49667 12.1991 2.5933L12 2.66699L12.1991 2.74069C12.4603 2.83731 12.5909 2.88563 12.6861 2.98088C12.7813 3.07613 12.8297 3.2067 12.9263 3.46784L13 3.66699L13.0737 3.46784C13.1703 3.2067 13.2187 3.07613 13.3139 2.98088C13.4091 2.88563 13.5397 2.83731 13.8009 2.74069L14 2.66699L13.8009 2.5933C13.5397 2.49667 13.4091 2.44835 13.3139 2.35311C13.2187 2.25785 13.1703 2.12729 13.0737 1.86615L13 1.66699ZM13 8.33366L12.9263 8.53279C12.8297 8.79393 12.7813 8.92452 12.6861 9.01979C12.5909 9.11499 12.4603 9.16332 12.1991 9.25999L12 9.33366L12.1991 9.40733C12.4603 9.50399 12.5909 9.55233 12.6861 9.64753C12.7813 9.74279 12.8297 9.87339 12.9263 10.1345L13 10.3337L13.0737 10.1345C13.1703 9.87339 13.2187 9.74279 13.3139 9.64753C13.4091 9.55233 13.5397 9.50399 13.8009 9.40733L14 9.33366L13.8009 9.25999C13.5397 9.16332 13.4091 9.11499 13.3139 9.01979C13.2187 8.92452 13.1703 8.79393 13.0737 8.53279L13 8.33366ZM7 1.66699L6.92633 1.86615C6.82967 2.12729 6.78133 2.25785 6.68613 2.35311C6.59086 2.44835 6.46029 2.49667 6.19915 2.5933L6 2.66699L6.19915 2.74069C6.46029 2.83731 6.59086 2.88563 6.68613 2.98088C6.78133 3.07613 6.82967 3.2067 6.92633 3.46784L7 3.66699L7.07367 3.46784C7.17033 3.2067 7.21867 3.07613 7.31387 2.98088C7.40913 2.88563 7.53973 2.83731 7.80087 2.74069L8 2.66699L7.80087 2.5933C7.53973 2.49667 7.40913 2.44835 7.31387 2.35311C7.21867 2.25785 7.17033 2.12729 7.07367 1.86615L7 1.66699Z"
      stroke="white"
      strokeLinejoin="round"
    />
  </Svg>
);

const InsightsIcon: React.FC = () => (
  <Svg
    width={SUBSCRIPTION_FEATURE_ICON_INNER}
    height={SUBSCRIPTION_FEATURE_ICON_INNER}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      d="M13.166 6.41347C13.166 6.13733 12.9422 5.91347 12.666 5.91347C12.3899 5.91347 12.166 6.13733 12.166 6.41347H12.666H13.166ZM10.5315 10.3275L10.8116 10.7417L10.8116 10.7417L10.5315 10.3275ZM10.0075 10.7471L9.58677 10.477L9.58666 10.4771L10.0075 10.7471ZM9.85775 11.3168L10.3509 11.3991L10.3509 11.399L9.85775 11.3168ZM9.81848 11.5522L9.3253 11.4699L9.32528 11.47L9.81848 11.5522ZM9.49895 12.5083L9.17578 12.1268L9.17571 12.1269L9.49895 12.5083ZM5.76665 12.5083L6.08986 12.1268L6.08985 12.1268L5.76665 12.5083ZM5.44712 11.5522L5.94032 11.47L5.94032 11.47L5.44712 11.5522ZM5.40789 11.3168L5.90109 11.2346L5.90109 11.2346L5.40789 11.3168ZM5.25914 10.7492L4.83768 11.0182L4.83769 11.0183L5.25914 10.7492ZM4.73537 10.3265L5.01756 9.91371L5.01752 9.91368L4.73537 10.3265ZM8.56503 1.92433C8.83548 1.9801 9.09994 1.80608 9.15571 1.53562C9.21149 1.26517 9.03746 1.00072 8.76701 0.94494L8.66602 1.43463L8.56503 1.92433ZM10.9993 1.33301L11.4683 1.1595C11.3957 0.963278 11.2086 0.833008 10.9993 0.833008C10.7901 0.833008 10.603 0.963279 10.5304 1.1595L10.9993 1.33301ZM11.1713 1.79769L10.7024 1.9712L10.7024 1.97121L11.1713 1.79769ZM11.7317 2.93393L12.0853 2.58037L12.0853 2.58037L11.7317 2.93393ZM12.868 3.49439L13.0415 3.02547L13.0415 3.02547L12.868 3.49439ZM13.3327 3.66634L13.5062 4.13527C13.7024 4.06266 13.8327 3.87556 13.8327 3.66634C13.8327 3.45712 13.7024 3.27002 13.5062 3.19742L13.3327 3.66634ZM12.868 3.83829L13.0415 4.30721L13.0415 4.30721L12.868 3.83829ZM11.1713 5.53499L10.7024 5.36147L10.7024 5.36148L11.1713 5.53499ZM10.9993 5.99967L10.5304 6.17318C10.603 6.3694 10.7901 6.49967 10.9993 6.49967C11.2086 6.49967 11.3957 6.3694 11.4683 6.17318L10.9993 5.99967ZM10.8274 5.53499L11.2963 5.36148L11.2963 5.36147L10.8274 5.53499ZM9.13068 3.83829L8.95716 4.30721L8.95716 4.30721L9.13068 3.83829ZM8.66602 3.66634L8.49249 3.19742C8.29628 3.27003 8.16602 3.45712 8.16602 3.66634C8.16602 3.87556 8.29628 4.06266 8.49249 4.13527L8.66602 3.66634ZM9.13068 3.49439L8.95716 3.02547L8.95716 3.02547L9.13068 3.49439ZM10.2669 2.93393L9.91341 2.58037L9.91341 2.58037L10.2669 2.93393ZM10.8274 1.79769L11.2963 1.97121L11.2963 1.9712L10.8274 1.79769ZM8.80408 14.4711L8.45053 14.1175V14.1175L8.80408 14.4711ZM6.52794 14.4711L6.17438 14.8246L6.17439 14.8246L6.52794 14.4711ZM12.666 6.41347H12.166C12.166 7.9454 11.4207 9.12254 10.2514 9.91329L10.5315 10.3275L10.8116 10.7417C12.2182 9.79041 13.166 8.32048 13.166 6.41347H12.666ZM10.5315 10.3275L10.2515 9.91329C10.1069 10.011 9.97877 10.0974 9.87897 10.1746C9.77892 10.2519 9.66981 10.3477 9.58677 10.477L10.0075 10.7471L10.4282 11.0173C10.4192 11.0313 10.4221 11.0186 10.4906 10.9657C10.5593 10.9126 10.6562 10.8468 10.8116 10.7417L10.5315 10.3275ZM10.0075 10.7471L9.58666 10.4771C9.50794 10.5998 9.46651 10.7258 9.43789 10.8437C9.41072 10.9557 9.3886 11.0903 9.36455 11.2346L9.85775 11.3168L10.3509 11.399C10.3774 11.2404 10.3931 11.1479 10.4097 11.0796C10.4248 11.0172 10.433 11.0098 10.4283 11.0171L10.0075 10.7471ZM9.85775 11.3168L9.36456 11.2345L9.3253 11.4699L9.81848 11.5522L10.3117 11.6345L10.3509 11.3991L9.85775 11.3168ZM9.81848 11.5522L9.32528 11.47C9.27884 11.7488 9.25072 11.912 9.2162 12.0279C9.20053 12.0805 9.18807 12.1067 9.18123 12.1186C9.17811 12.1241 9.17634 12.1262 9.17614 12.1265C9.17602 12.1266 9.17611 12.1265 9.17578 12.1268L9.49895 12.5083L9.82212 12.8899C10.0175 12.7244 10.1142 12.5163 10.1746 12.3132C10.2311 12.1236 10.2695 11.8878 10.3117 11.6344L9.81848 11.5522ZM9.49895 12.5083L9.17571 12.1269C9.17541 12.1271 9.17551 12.127 9.17536 12.1271C9.17509 12.1273 9.17267 12.1287 9.16678 12.1309C9.15389 12.1356 9.12606 12.1436 9.07154 12.1504C8.9515 12.1654 8.78586 12.1663 8.50328 12.1663V12.6663V13.1663C8.76018 13.1663 8.99913 13.1672 9.19544 13.1427C9.4056 13.1165 9.62682 13.0553 9.82218 12.8898L9.49895 12.5083ZM8.50328 12.6663V12.1663H6.76228V12.6663V13.1663H8.50328V12.6663ZM6.76228 12.6663V12.1663C6.47974 12.1663 6.31411 12.1654 6.19407 12.1504C6.13955 12.1436 6.11172 12.1356 6.09882 12.1309C6.09293 12.1287 6.09051 12.1273 6.09023 12.1271C6.09007 12.127 6.09017 12.1271 6.08986 12.1268L5.76665 12.5083L5.44344 12.8898C5.6388 13.0553 5.86001 13.1165 6.07017 13.1427C6.26648 13.1672 6.50542 13.1663 6.76228 13.1663V12.6663ZM5.76665 12.5083L6.08985 12.1268C6.08953 12.1266 6.08962 12.1266 6.0895 12.1265C6.08929 12.1263 6.08752 12.1241 6.0844 12.1186C6.07756 12.1067 6.06509 12.0806 6.04942 12.0279C6.0149 11.912 5.98677 11.7487 5.94032 11.47L5.44712 11.5522L4.95393 11.6344C4.99616 11.8878 5.03454 12.1236 5.09099 12.3133C5.15143 12.5162 5.24811 12.7244 5.44345 12.8898L5.76665 12.5083ZM5.44712 11.5522L5.94032 11.47L5.90109 11.2346L5.40789 11.3168L4.91469 11.399L4.95393 11.6344L5.44712 11.5522ZM5.40789 11.3168L5.90109 11.2346C5.87711 11.0908 5.85508 10.9567 5.8281 10.8452C5.79971 10.728 5.75864 10.6024 5.68058 10.4802L5.25914 10.7492L4.83769 11.0183C4.83292 11.0108 4.84107 11.0181 4.85616 11.0805C4.87266 11.1486 4.88836 11.241 4.91469 11.399L5.40789 11.3168ZM5.25914 10.7492L5.68059 10.4802C5.59813 10.351 5.48921 10.255 5.38983 10.1775C5.29033 10.0999 5.16235 10.0127 5.01756 9.91371L4.73537 10.3265L4.45319 10.7392C4.60871 10.8456 4.70599 10.9123 4.77499 10.9661C4.8441 11.02 4.8469 11.0327 4.83768 11.0182L5.25914 10.7492ZM4.73537 10.3265L5.01752 9.91368C3.87013 9.12941 3.16602 7.95584 3.16602 6.41347H2.66602H2.16602C2.16602 8.30831 3.05205 9.78152 4.45322 10.7393L4.73537 10.3265ZM2.66602 6.41347H3.16602C3.16602 3.8762 5.18823 1.83301 7.66602 1.83301V1.33301V0.833008C4.62095 0.833008 2.16602 3.33902 2.16602 6.41347H2.66602ZM7.66602 1.33301V1.83301C7.97433 1.83301 8.2749 1.8645 8.56503 1.92433L8.66602 1.43463L8.76701 0.94494C8.41087 0.871493 8.04263 0.833008 7.66602 0.833008V1.33301ZM10.9993 1.33301L10.5304 1.50651L10.7024 1.9712L11.1713 1.79769L11.6402 1.62419L11.4683 1.1595L10.9993 1.33301ZM11.1713 1.79769L10.7024 1.97121C10.9119 2.53763 11.0604 2.96977 11.3782 3.2875L11.7317 2.93393L12.0853 2.58037C11.9585 2.45361 11.8816 2.27641 11.6402 1.62418L11.1713 1.79769ZM11.7317 2.93393L11.3782 3.2875C11.696 3.60522 12.1281 3.75372 12.6945 3.96332L12.868 3.49439L13.0415 3.02547C12.3893 2.78412 12.2121 2.70715 12.0853 2.58037L11.7317 2.93393ZM12.868 3.49439L12.6945 3.96332L13.1592 4.13527L13.3327 3.66634L13.5062 3.19742L13.0415 3.02547L12.868 3.49439ZM13.3327 3.66634L13.1592 3.19742L12.6945 3.36936L12.868 3.83829L13.0415 4.30721L13.5062 4.13527L13.3327 3.66634ZM12.868 3.83829L12.6945 3.36936C12.1281 3.57896 11.696 3.72746 11.3782 4.04518L11.7317 4.39875L12.0853 4.75232C12.2121 4.62554 12.3893 4.54856 13.0415 4.30721L12.868 3.83829ZM11.7317 4.39875L11.3782 4.04518C11.0604 4.36291 10.9119 4.79505 10.7024 5.36147L11.1713 5.53499L11.6402 5.7085C11.8816 5.05627 11.9585 4.87907 12.0853 4.75232L11.7317 4.39875ZM11.1713 5.53499L10.7024 5.36148L10.5304 5.82617L10.9993 5.99967L11.4683 6.17318L11.6402 5.70849L11.1713 5.53499ZM10.9993 5.99967L11.4683 5.82617L11.2963 5.36148L10.8274 5.53499L10.3585 5.70849L10.5304 6.17318L10.9993 5.99967ZM10.8274 5.53499L11.2963 5.36147C11.0868 4.79505 10.9383 4.36291 10.6205 4.04518L10.2669 4.39875L9.91341 4.75232C10.0402 4.87907 10.1171 5.05627 10.3585 5.7085L10.8274 5.53499ZM10.2669 4.39875L10.6205 4.04518C10.3027 3.72746 9.87064 3.57896 9.3042 3.36936L9.13068 3.83829L8.95716 4.30721C9.60939 4.54856 9.78662 4.62554 9.91341 4.75232L10.2669 4.39875ZM9.13068 3.83829L9.3042 3.36936L8.83954 3.19742L8.66602 3.66634L8.49249 4.13527L8.95716 4.30721L9.13068 3.83829ZM8.66602 3.66634L8.83954 4.13527L9.3042 3.96332L9.13068 3.49439L8.95716 3.02547L8.49249 3.19742L8.66602 3.66634ZM9.13068 3.49439L9.3042 3.96332C9.87063 3.75372 10.3027 3.60522 10.6205 3.2875L10.2669 2.93393L9.91341 2.58037C9.78662 2.70715 9.6094 2.78412 8.95716 3.02547L9.13068 3.49439ZM10.2669 2.93393L10.6205 3.2875C10.9383 2.96977 11.0868 2.53763 11.2963 1.97121L10.8274 1.79769L10.3585 1.62418C10.1171 2.27641 10.0402 2.45361 9.91341 2.58037L10.2669 2.93393ZM10.8274 1.79769L11.2963 1.9712L11.4683 1.50651L10.9993 1.33301L10.5304 1.1595L10.3585 1.62419L10.8274 1.79769ZM8.99935 12.6663H8.49935V13.333H8.99935H9.49935V12.6663H8.99935ZM8.99935 13.333H8.49935C8.49935 13.6614 8.49829 13.8574 8.4794 13.9979C8.47075 14.0623 8.46055 14.0945 8.45458 14.109C8.45319 14.1124 8.45211 14.1146 8.45144 14.1159C8.45078 14.1172 8.45041 14.1177 8.45037 14.1178C8.45034 14.1178 8.45044 14.1177 8.45063 14.1174C8.45082 14.1172 8.45083 14.1172 8.45053 14.1175L8.80408 14.4711L9.15764 14.8246C9.36365 14.6186 9.43862 14.3681 9.47048 14.1311C9.50041 13.9085 9.49935 13.6331 9.49935 13.333H8.99935ZM8.80408 14.4711L8.45053 14.1175C8.45022 14.1178 8.45021 14.1178 8.45044 14.1176C8.45067 14.1174 8.45083 14.1173 8.45079 14.1174C8.45073 14.1174 8.45016 14.1178 8.44889 14.1184C8.4476 14.1191 8.44539 14.1202 8.44203 14.1216C8.42751 14.1275 8.39527 14.1377 8.3309 14.1464C8.19042 14.1653 7.99442 14.1663 7.66602 14.1663V14.6663V15.1663C7.96615 15.1663 8.24155 15.1674 8.46415 15.1375C8.70114 15.1056 8.95162 15.0306 9.15764 14.8246L8.80408 14.4711ZM7.66602 14.6663V14.1663C7.33761 14.1663 7.14161 14.1653 7.00113 14.1464C6.93676 14.1377 6.90452 14.1275 6.89 14.1216C6.88663 14.1202 6.88442 14.1191 6.88313 14.1184C6.88186 14.1178 6.88129 14.1174 6.88124 14.1174C6.88119 14.1173 6.88135 14.1174 6.88158 14.1176C6.88181 14.1178 6.8818 14.1178 6.88149 14.1175L6.52794 14.4711L6.17439 14.8246C6.38041 15.0306 6.63089 15.1056 6.86788 15.1375C7.09049 15.1674 7.36588 15.1663 7.66602 15.1663V14.6663ZM6.52794 14.4711L6.8815 14.1175C6.8812 14.1172 6.88121 14.1172 6.8814 14.1174C6.88159 14.1177 6.88169 14.1178 6.88166 14.1178C6.88163 14.1177 6.88125 14.1172 6.88059 14.1159C6.87992 14.1146 6.87884 14.1124 6.87745 14.109C6.87148 14.0945 6.86129 14.0623 6.85263 13.9979C6.83374 13.8574 6.83268 13.6614 6.83268 13.333H6.33268H5.83268C5.83268 13.6331 5.83162 13.9085 5.86155 14.1311C5.89341 14.3681 5.96837 14.6186 6.17438 14.8246L6.52794 14.4711ZM6.33268 13.333H6.83268V12.6663H6.33268H5.83268V13.333H6.33268Z"
      fill="white"
    />
  </Svg>
);

const FEATURES = [
  {
    key: 'introductions',
    icon: <IntroductionsIcon />,
    title: 'Aira Introductions',
    description: 'Aira introduces you, so the conversation starts warm, not cold.',
  },
  {
    key: 'messaging',
    icon: <MessagingIcon />,
    title: 'Unlimited Messaging',
    description: 'No limits mid-conversation. Just talk.',
  },
  {
    key: 'ai',
    icon: <AIAssistIcon />,
    title: 'In-Chat AI Assistance',
    description: 'Stuck on what to say? Aira suggests replies that actually sound like you.',
  },
  {
    key: 'insights',
    icon: <InsightsIcon />,
    title: 'Profile Match Insights',
    description: 'Compatibility scores, shared traits, and ready-made conversation starters.',
  },
] as const;

/** GBP amount for the price pill; Figma uses separate "/month" label (4285:14457). */
function splitDisplayPrice(displayPrice: string): string {
  return formatSubscriptionAmountGBP(displayPrice);
}

function priceAmountTypography(amount: string): { fontSize: number; lineHeight: number } {
  if (amount.length <= 4) {
    return { fontSize: 36, lineHeight: 44 };
  }
  if (amount.length <= 6) {
    return { fontSize: 32, lineHeight: 40 };
  }
  return { fontSize: 28, lineHeight: 36 };
}

type PricePillProps = {
  displayPrice: string;
};

const PricePill: React.FC<PricePillProps> = ({ displayPrice }) => {
  const amount = splitDisplayPrice(displayPrice);
  const amountType = priceAmountTypography(amount);

  return (
    <View style={styles.pricePillShell}>
      <View style={[StyleSheet.absoluteFillObject, styles.pricePillUnderlay]} />
      <LinearGradient
        colors={[SUBSCRIPTION_PRICE_GRADIENT_TOP, SUBSCRIPTION_PRICE_GRADIENT_BOTTOM]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.pricePillContent}>
        <Text
          style={[
            styles.priceAmount,
            { fontSize: amountType.fontSize, lineHeight: amountType.lineHeight },
          ]}
        >
          {amount}
        </Text>
        <Text style={styles.pricePeriod}>/month</Text>
      </View>
    </View>
  );
};

type PurchaseFooterProps = {
  displayPrice: string;
  isLoading: boolean;
  hasProduct: boolean;
  showRetry: boolean;
  bottomInset: number;
  onBuy: () => void;
  onRetry: () => void;
};

const PurchaseFooter: React.FC<PurchaseFooterProps> = ({
  displayPrice,
  isLoading,
  hasProduct,
  showRetry,
  bottomInset,
  onBuy,
  onRetry,
}) => (
  <View style={styles.purchaseWrap}>
    <View style={styles.bottomPanelWrap}>
      <View style={styles.pricePillOuter}>
        <PricePill displayPrice={displayPrice} />
      </View>

      <View
        style={[
          styles.bottomPanel,
          { paddingBottom: SUBSCRIPTION_BOTTOM_PANEL_PAD_BOTTOM + bottomInset },
        ]}
      >
        <TouchableOpacity
          style={[styles.ctaButton, (isLoading || !hasProduct) && styles.ctaButtonDisabled]}
          onPress={onBuy}
          disabled={isLoading || !hasProduct}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={SUBSCRIPTION_GRADIENT_START} />
          ) : (
            <Text style={styles.ctaButtonText}>Unlock Aira Plus</Text>
          )}
        </TouchableOpacity>

        {showRetry ? (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.legalText}>
          Subscription auto-renews monthly. Cancel anytime from your Play Store or App Store
          settings.
        </Text>
      </View>
    </View>
  </View>
);

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSubscribed = useSubscriptionStore((s) => s.isSubscribed);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const scale = useCallback((value: number) => scaleSubscription(value, windowWidth), [windowWidth]);
  const bottomInset = Math.max(insets.bottom, 0);

  const showManage = isSubscribed;
  const showPurchase = !isSubscribed;

  const {
    subscriptions,
    isInitializing,
    isLoading,
    buySubscription,
    reloadProducts,
  } = useIAP({ enabled: isAuthenticated });

  const {
    isLoading: entitlementsLoading,
    primaryEntitlement,
  } = useSubscriptionEntitlements(showManage);

  const handleBuy = useCallback(
    (productId: string) => {
      void buySubscription(productId, user?.id);
    },
    [buySubscription, user?.id],
  );

  const monthlyProduct =
    subscriptions.find((item) => item.id.toLowerCase().includes('month')) ?? subscriptions[0];

  const storeDisplayPrice = monthlyProduct?.displayPrice;
  const displayPrice = formatSubscriptionAmountGBP(storeDisplayPrice);
  const bottomPanelReserve =
    scale(SUBSCRIPTION_BOTTOM_PANEL_HEIGHT - SUBSCRIPTION_PRICE_PILL_OVERLAP) + bottomInset;

  if (showManage) {
    return (
      <ManageSubscriptionView
        entitlement={primaryEntitlement}
        hasActiveSubscription={isSubscribed}
        isLoading={entitlementsLoading}
        displayPrice={storeDisplayPrice}
      />
    );
  }

  if (isInitializing) {
    return (
      <View style={styles.wrapper}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <SubscriptionBackground />
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SubscriptionBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.canvas}>
          <View style={[styles.main, { paddingBottom: bottomPanelReserve }]}>
            <View style={styles.header}>
              <Text style={styles.upgradeToText}>Upgrade to</Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <CloseIcon size={24} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>

              <View style={styles.logoBlock}>
                <View style={styles.logoRow}>
                  <LogoWordmark
                    width={scale(SUBSCRIPTION_LOGO_WIDTH)}
                    height={scale(SUBSCRIPTION_LOGO_HEIGHT)}
                  />
                  <View style={styles.plusBadge}>
                    <MaskedView maskElement={<Text style={styles.plusText}>plus</Text>}>
                      <LinearGradient
                        colors={[SUBSCRIPTION_GRADIENT_START, SUBSCRIPTION_GRADIENT_END]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                      >
                        <Text style={[styles.plusText, styles.plusTextHidden]}>plus</Text>
                      </LinearGradient>
                    </MaskedView>
                    <PlusGemIcon />
                  </View>
                </View>

                <Text style={styles.subtitleText}>
                  Your AI dating co-pilot, fully unlocked.
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              {FEATURES.map((feature) => (
                <View key={feature.key} style={styles.featureRow}>
                  <View style={styles.featureIconContainer}>{feature.icon}</View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <PurchaseFooter
            displayPrice={displayPrice}
            isLoading={isLoading}
            hasProduct={Boolean(monthlyProduct)}
            showRetry={subscriptions.length === 0 && !isLoading}
            bottomInset={bottomInset}
            onBuy={() => monthlyProduct && handleBuy(monthlyProduct.id)}
            onRetry={() => void reloadProducts()}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SubscriptionScreen;
