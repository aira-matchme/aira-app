import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, useNavigation, useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeStackNavigator } from './HomeStackNavigator';
import { ChatStackNavigator } from './ChatStackNavigator';
import { MatchScreen } from '../screens/MatchScreen';
import { LikesScreen } from '../screens/LikesScreen/index';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { TabStackParamList } from './types';
import { colors } from '../theme';
import socketService, { type IncomingCallPayload } from '../services/socket/socketService';
import { useAuthStore } from '../store/auth.store';
import {
  TabWalkthroughProvider,
  TabWalkthroughMeasuringView,
  useTabWalkthrough,
  type TabWalkthroughStepId,
} from './TabWalkthroughContext';

import { TabBarIcon } from '../assets/icons/tabs/TabBarIcon';
import { TabHomeIcon } from '../assets/icons/tabs/TabHomeIcon';
import { TabChatIcon } from '../assets/icons/tabs/TabChatIcon';
import { TabLikesIcon } from '../assets/icons/tabs/TabLikesIcon';
import { TabProfileIcon } from '../assets/icons/tabs/TabProfileIcon';
import { TabAICenterIcon } from '../assets/icons/tabs/TabAICenterIcon';
import { TAB_BAR_ACTIVE_ICONS } from '../assets/icons/tabs/tabBarActiveIcons';
import {
  TAB_BAR_BORDER_RADIUS,
  TAB_BAR_PADDING_TOP,
  TAB_BAR_ICON_LABEL_GAP,
  getTabBarBottomPadding,
  getTabBarOccupiedHeight,
} from './tabBarLayout';

const Tab = createBottomTabNavigator<TabStackParamList>();

/** Spotlight measures the glyph only; the press target stays the full tab cell. */
function WalkthroughTabIcon({
  id,
  children,
}: {
  id: TabWalkthroughStepId;
  children: React.ReactNode;
}) {
  return (
    <TabWalkthroughMeasuringView id={id} style={styles.tabIconWalkthroughHost}>
      {children}
    </TabWalkthroughMeasuringView>
  );
}

function renderTabBarPressable(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      {...(props as React.ComponentProps<typeof Pressable>)}
      style={[styles.tabMeasureCell, props.style, styles.tabPressable]}
    />
  );
}

// Figma 2778-10903: bottom nav — 87px total height, flush to screen bottom
const TAB_ICON_SIZE = 24;
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
      <TabWalkthroughMeasuringView id="tab_ai" style={styles.centerAiWalkthroughHost}>
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
      </TabWalkthroughMeasuringView>
    </View>
  );
}

function TabNavigatorInner() {
  const { visibleForTabBar: isWalkthroughVisible } = useTabWalkthrough();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const tabState = useNavigationState((state) => state);
  const bottomPadding = getTabBarBottomPadding(insets.bottom);
  const tabBarOccupiedHeight = getTabBarOccupiedHeight(insets.bottom);
  const tabBarStyle: StyleProp<ViewStyle> = [
    styles.tabBar,
    {
      height: tabBarOccupiedHeight,
      paddingTop: TAB_BAR_PADDING_TOP,
      paddingBottom: bottomPadding,
      left: 0,
      right: 0,
      bottom: 0,
    },
  ];

  useEffect(() => {
    const unsubscribeIncomingCall = socketService.on<IncomingCallPayload>('incoming_call', (payload) => {
      if (!payload) return;
      if (currentUserId && payload.receiverId && payload.receiverId !== currentUserId) return;

      const currentTabRoute = tabState.routes[tabState.index];
      const currentNestedRouteName =
        currentTabRoute?.state && typeof currentTabRoute.state === 'object'
          ? (currentTabRoute.state as { index: number; routes: Array<{ name: string }> }).routes[
              (currentTabRoute.state as { index: number; routes: Array<{ name: string }> }).index
            ]?.name
          : undefined;

      if (currentTabRoute?.name === 'Chat' && currentNestedRouteName === 'ChatDetail') {
        return;
      }

      const mode = payload.callType === 'video' ? 'video' : 'voice';
      (navigation as any).navigate('Tabs', {
        screen: 'Chat',
        params: {
          screen: 'ChatDetail',
          params: {
            chatId: payload.chatId ?? null,
            name: payload.callerName,
            avatar: payload.callerAvatar ? { uri: payload.callerAvatar } : undefined,
            otherUserId: payload.senderId,
            incomingCall: {
              mode,
              callId: payload.callId,
              callerName: payload.callerName,
              callerAvatar: payload.callerAvatar,
              senderId: payload.senderId,
              channelName: payload.channelName,
              rtcToken: payload.rtcToken,
            },
          },
        },
      });
    });

    return () => unsubscribeIncomingCall();
  }, [currentUserId, navigation, tabState]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        lazy: false,
        safeAreaInsets: { bottom: 0 },
        tabBarActiveTintColor: colors.primary.purple,
        tabBarInactiveTintColor: '#949494',
        tabBarStyle,
        tabBarShowLabel: true,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
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
              <WalkthroughTabIcon id="tab_home">
                <TabBarIcon
                  focused={focused}
                  ActiveIcon={TAB_BAR_ACTIVE_ICONS.home}
                  size={TAB_ICON_SIZE}
                >
                  <TabHomeIcon
                    color={color}
                    width={TAB_ICON_SIZE}
                    height={TAB_ICON_SIZE}
                  />
                </TabBarIcon>
              </WalkthroughTabIcon>
            ),
            tabBarStyle: hideTabBar ? { display: 'none' } : tabBarStyle,
            tabBarButton: renderTabBarPressable,
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
            tabBarIcon: ({ color, focused }) => (
              <WalkthroughTabIcon id="tab_chat">
                <TabBarIcon
                  focused={focused}
                  ActiveIcon={TAB_BAR_ACTIVE_ICONS.chat}
                  size={TAB_ICON_SIZE}
                >
                  <TabChatIcon
                    color={color}
                    width={TAB_ICON_SIZE}
                    height={TAB_ICON_SIZE}
                  />
                </TabBarIcon>
              </WalkthroughTabIcon>
            ),
            tabBarStyle: isChatDetail ? { display: 'none' } : tabBarStyle,
            tabBarButton: renderTabBarPressable,
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
            <WalkthroughTabIcon id="tab_likes">
              <TabBarIcon
                focused={focused}
                ActiveIcon={TAB_BAR_ACTIVE_ICONS.likes}
                size={TAB_ICON_SIZE}
              >
                <TabLikesIcon
                  color={color}
                  width={TAB_ICON_SIZE}
                  height={TAB_ICON_SIZE}
                />
              </TabBarIcon>
            </WalkthroughTabIcon>
          ),
          tabBarButton: renderTabBarPressable,
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
            tabBarIcon: ({ color, focused }) => (
              <WalkthroughTabIcon id="tab_profile">
                <TabBarIcon
                  focused={focused}
                  ActiveIcon={TAB_BAR_ACTIVE_ICONS.profile}
                  size={TAB_ICON_SIZE}
                >
                  <TabProfileIcon
                    color={color}
                    width={TAB_ICON_SIZE}
                    height={TAB_ICON_SIZE}
                  />
                </TabBarIcon>
              </WalkthroughTabIcon>
            ),
            tabBarStyle: hideTabBar ? { display: 'none' } : tabBarStyle,
            tabBarButton: renderTabBarPressable,
          };
        }}
      />
    </Tab.Navigator>
  );
}

export const TabNavigator = () => (
  <TabWalkthroughProvider>
    <View style={styles.navigatorRoot}>
      <TabNavigatorInner />
    </View>
  </TabWalkthroughProvider>
);

const styles = StyleSheet.create({
  navigatorRoot: {
    flex: 1,
    overflow: 'visible',
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    borderTopLeftRadius: TAB_BAR_BORDER_RADIUS,
    borderTopRightRadius: TAB_BAR_BORDER_RADIUS,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'absolute',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  tabBarItem: {
    paddingTop: 0,
    marginTop: 0,
    justifyContent: 'flex-start',
  },
  tabBarIcon: {
    marginBottom: TAB_BAR_ICON_LABEL_GAP,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
    marginTop: 0,
    marginBottom: 0,
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
  tabMeasureCell: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWalkthroughHost: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAiWalkthroughHost: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
