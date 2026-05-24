import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TabNavigator } from './TabNavigator';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SCREENS } from '../constants/screens';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.badgeBorder,
        },
        headerTintColor: colors.title,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: colors.mainBtn,
        drawerInactiveTintColor: colors.subtitle,
      }}
    >
      <Drawer.Screen
        name={SCREENS.MAIN_TABS}
        component={TabNavigator}
        options={{
          title: 'Home',
          headerShown: false
        }}
      />
      <Drawer.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Drawer.Screen
        name={SCREENS.SETTINGS}
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Drawer.Navigator>
  );
};
