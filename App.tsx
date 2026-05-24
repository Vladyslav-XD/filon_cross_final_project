import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './src/navigation/TabNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { SplashScreen } from './src/screens/SplashScreen';

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);

  if (splashVisible) {
    return (
      <SafeAreaProvider style={{ flex: 1 }}>
        <GestureHandlerRootView style={styles.container}>
          <SplashScreen onFinish={() => setSplashVisible(false)} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <ThemeProvider>
            <FavoritesProvider>
              <NavigationContainer>
                <TabNavigator />
              </NavigationContainer>
            </FavoritesProvider>
          </ThemeProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
