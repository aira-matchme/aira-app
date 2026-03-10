import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { QueryProvider } from './src/app/QueryProvider'
import { AppProvider } from './src/app/AppProvider';
import { AuthProvider } from './src/app/AuthProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <QueryProvider>
        <AppProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </AppProvider>
      </QueryProvider>

      <Toast />
    </SafeAreaProvider>
  );
};

export default App;