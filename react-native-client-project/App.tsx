import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { QueryProvider } from '@app/QueryProvider';
import { AppProvider } from '@app/AppProvider';
import { RootNavigator } from '@navigation/RootNavigator';
import { setupInterceptors } from '@services/api/interceptors';

const App = () => {
  useEffect(() => {
    setupInterceptors();
  }, []);

  return (
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
  );
};

export default App;
