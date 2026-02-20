import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/DashboardScreen';
import { ChatStackNavigator } from './ChatStackNavigator';
import { MatchScreen } from '../screens/MatchScreen';
// import { LikesScreen } from '../screens/LikesScreen';
import { LikesScreen } from '../screens/LikesScreen/index';
import { ProfileTabScreen } from '../screens/ProfileTabScreen';
import { TabStackParamList } from './types';
import { colors } from '../theme';

import { TabHomeIcon } from '../assets/icons/tabs/TabHomeIcon';
import { TabChatIcon } from '../assets/icons/tabs/TabChatIcon';
import { TabLikesIcon } from '../assets/icons/tabs/TabLikesIcon';
import { TabProfileIcon } from '../assets/icons/tabs/TabProfileIcon';
import { TabAICenterIcon } from '../assets/icons/tabs/TabAICenterIcon';
// import  TabAICenterIcon  from '../assets/icons/tabs/TabAICenterIcon';

const Tab = createBottomTabNavigator<TabStackParamList>();

// Figma 1758-4797: exact specs
const TAB_ICON_SIZE = 24;
const TAB_BAR_HORIZONTAL_MARGIN = 4;
const TAB_BAR_BORDER_RADIUS = 24;
const TAB_BAR_CONTENT_HEIGHT = 56;
const TAB_BAR_PADDING_BOTTOM = 24; // Figma: padding below content for safe area
const CENTER_BUTTON_DIAMETER = 56;
const CENTER_BUTTON_TOP_OFFSET = -36; // Protrudes 36px above bar

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
      <TouchableOpacity
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
      </TouchableOpacity>
    </View>
  );
}

export const TabNavigator = () => {
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.purple,
        tabBarInactiveTintColor: '#949494',
        tabBarStyle,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabHomeIcon
              color={color}
              filled={focused}
              width={TAB_ICON_SIZE}
              height={TAB_ICON_SIZE}
            />
          ),
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
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabProfileIcon color={color} width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

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
    // Figma 1758-4797: bar shadow
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
