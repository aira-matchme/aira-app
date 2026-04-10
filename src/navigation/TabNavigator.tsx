import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CopilotProvider, CopilotStep, walkthroughable, useCopilot } from 'react-native-copilot';

import { HomeStackNavigator } from './HomeStackNavigator';
import { ChatStackNavigator } from './ChatStackNavigator';
import { MatchScreen } from '../screens/MatchScreen';
import { LikesScreen } from '../screens/LikesScreen/index';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { TabStackParamList } from './types';
import { colors } from '../theme';
import { STRINGS } from '../constants/strings';
import { TabWalkthroughTooltip } from '../components/TabWalkthroughTooltip';

import { TabHomeIcon } from '../assets/icons/tabs/TabHomeIcon';
import { TabChatIcon } from '../assets/icons/tabs/TabChatIcon';
import { TabLikesIcon } from '../assets/icons/tabs/TabLikesIcon';
import { TabProfileIcon } from '../assets/icons/tabs/TabProfileIcon';
import { TabAICenterIcon } from '../assets/icons/tabs/TabAICenterIcon';

const Tab = createBottomTabNavigator<TabStackParamList>();

const w = STRINGS.DASHBOARD_WALKTHROUGH;

const COPILOT_TAB_PROFILE = `${w.STEP_PROFILE_TITLE}\n\n${w.STEP_PROFILE_TAB}`;
const COPILOT_TAB_LIKES = `${w.STEP_LIKES_TITLE}\n\n${w.STEP_LIKES_TAB}`;
const COPILOT_TAB_AI = `${w.STEP_AI_TITLE}\n\n${w.STEP_AI_TAB}`;
const COPILOT_TAB_CHAT = `${w.STEP_CHAT_TITLE}\n\n${w.STEP_CHAT_TAB}`;
const COPILOT_TAB_HOME = `${w.STEP_HOME_TITLE}\n\n${w.STEP_HOME_TAB}`;

const CopilotTouchableOpacity = walkthroughable(TouchableOpacity);

const EmptyStepNumber = () => null;

function copilotTabButton(order: number, name: string, text: string) {
  return (props: BottomTabBarButtonProps) => (
    <CopilotStep order={order} name={name} text={text}>
      {/* Tab bar passes Pressable-shaped props; TouchableOpacity is compatible at runtime. */}
      <CopilotTouchableOpacity {...(props as object)} />
    </CopilotStep>
  );
}

// Figma 1758-4797: exact specs
const TAB_ICON_SIZE = 24;
const TAB_BAR_HORIZONTAL_MARGIN = 4;
const TAB_BAR_BORDER_RADIUS = 24;
const TAB_BAR_CONTENT_HEIGHT = 56;
const TAB_BAR_PADDING_BOTTOM = 24;
const CENTER_BUTTON_DIAMETER = 56;
const CENTER_BUTTON_TOP_OFFSET = -36;

function CenterTabButton({
  onPress,
  onLongPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  testID,
  disabled,
  delayLongPress,
}: BottomTabBarButtonProps) {
  return (
    <View style={styles.centerButtonWrapper}>
      <CopilotStep order={4} name="tab_ai" text={COPILOT_TAB_AI}>
        <CopilotTouchableOpacity
          style={styles.centerButton}
          onPress={onPress}
          onLongPress={onLongPress ?? undefined}
          accessibilityRole={accessibilityRole}
          accessibilityState={accessibilityState ?? undefined}
          accessibilityLabel={accessibilityLabel}
          testID={testID}
          disabled={disabled ?? undefined}
          delayLongPress={delayLongPress ?? undefined}
          activeOpacity={0.85}
        >
          <TabAICenterIcon />
        </CopilotTouchableOpacity>
      </CopilotStep>
    </View>
  );
}

function TabNavigatorInner() {
  const { visible: isWalkthroughVisible } = useCopilot();
  const insets = useSafeAreaInsets();
  const bottomPadding = TAB_BAR_PADDING_BOTTOM + insets.bottom;
  const tabBarStyle = [
    styles.tabBar,
    {
      height: TAB_BAR_CONTENT_HEIGHT + bottomPadding,
      paddingBottom: bottomPadding,
      marginHorizontal: TAB_BAR_HORIZONTAL_MARGIN,
      left: TAB_BAR_HORIZONTAL_MARGIN,
      right: TAB_BAR_HORIZONTAL_MARGIN,
      bottom: 0,
    },
  ];

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        lazy: false,
        tabBarActiveTintColor: colors.primary.purple,
        tabBarInactiveTintColor: '#949494',
        tabBarStyle,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Dashboard';
          const hideTabBar = routeName === 'Notifications';
          return {
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabHomeIcon
                color={color}
                filled={focused}
                width={TAB_ICON_SIZE}
                height={TAB_ICON_SIZE}
              />
            ),
            tabBarStyle: hideTabBar ? { display: 'none' } : tabBarStyle,
            tabBarButton: copilotTabButton(6, 'tab_home', COPILOT_TAB_HOME),
          };
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ChatList';
          const isChatDetail = routeName === 'ChatDetail';
          return {
            tabBarLabel: 'Chat',
            sceneStyle: { backgroundColor: colors.neutral[50] },
            tabBarIcon: ({ color }) => (
              <TabChatIcon color={color} width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />
            ),
            tabBarStyle: isChatDetail ? { display: 'none' } : tabBarStyle,
            tabBarButton: copilotTabButton(5, 'tab_chat', COPILOT_TAB_CHAT),
          };
        }}
      />
      <Tab.Screen
        name="Match"
        component={MatchScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => <CenterTabButton {...props} />,
          // Keep tab bar visible during walkthrough so AI step target behaves like other tab steps.
          tabBarStyle: isWalkthroughVisible ? tabBarStyle : { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Likes"
        component={LikesScreen}
        options={{
          tabBarLabel: 'Likes',
          sceneStyle: { backgroundColor: colors.neutral[50] },
          tabBarIcon: ({ color, focused }) => (
            <TabLikesIcon
              color={color}
              filled={focused}
              width={TAB_ICON_SIZE}
              height={TAB_ICON_SIZE}
            />
          ),
          tabBarButton: copilotTabButton(3, 'tab_likes', COPILOT_TAB_LIKES),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ProfileMain';
          const hideTabBar = routeName !== 'ProfileMain';
          return {
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color }) => (
              <TabProfileIcon color={color} width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />
            ),
            tabBarStyle: hideTabBar ? { display: 'none' } : tabBarStyle,
            tabBarButton: copilotTabButton(2, 'tab_profile', COPILOT_TAB_PROFILE),
          };
        }}
      />
    </Tab.Navigator>
  );
}

export const TabNavigator = () => (
  <CopilotProvider
    overlay="svg"
    tooltipComponent={TabWalkthroughTooltip}
    stepNumberComponent={EmptyStepNumber}
    backdropColor="rgba(0, 0, 0, 0.45)"
    arrowColor={colors.white}
    tooltipStyle={{
      backgroundColor: colors.white,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 14,
    }}
    labels={{
      skip: w.SKIP,
      previous: w.PREVIOUS,
      next: w.NEXT,
      finish: w.NEXT,
    }}
  >
    <TabNavigatorInner />
  </CopilotProvider>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    paddingTop: 8,
    borderTopLeftRadius: TAB_BAR_BORDER_RADIUS,
    borderTopRightRadius: TAB_BAR_BORDER_RADIUS,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'absolute',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerButtonWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: CENTER_BUTTON_TOP_OFFSET,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary.purple,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    }),
    ...(Platform.OS === 'android' && { elevation: 8 }),
  },
  centerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: CENTER_BUTTON_DIAMETER,
    height: CENTER_BUTTON_DIAMETER,
  },
});
