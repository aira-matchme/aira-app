import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatScreen } from '../screens/ChatScreen';
import { ChatDetailScreen } from '../screens/ChatDetailScreen';
import { ChatStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export const ChatStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.neutral[50] },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="ChatList" component={ChatScreen} />
    <Stack.Screen
      name="ChatDetail"
      component={ChatDetailScreen}
      options={{
        animation: 'slide_from_right',
        contentStyle: { flex: 1, backgroundColor: colors.white },
        fullScreenGestureEnabled: true,
      }}
    />
  </Stack.Navigator>
);
