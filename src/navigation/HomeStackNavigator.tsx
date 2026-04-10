import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '../screens/DashboardScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { HomeStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.white },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        contentStyle: { flex: 1, backgroundColor: colors.white },
        fullScreenGestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
