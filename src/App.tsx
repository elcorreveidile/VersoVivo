/**
 * Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '@store/index';
import RootNavigator from '@navigation/RootNavigator';
import { colors } from '@theme/index';

const App: React.FC = () => {
  useEffect(() => {
    // Any app initialization logic here
    console.log('VersoVivo App Started');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background.dark}
        />
        <RootNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
