import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';  
import Toast from 'react-native-toast-message';

import { QueryProvider } from './src/app/QueryProvider'
import { AppProvider } from './src/app/AppProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
  
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <QueryProvider>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </QueryProvider>

      {/* Global Toast Layer */}
      <Toast />
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
