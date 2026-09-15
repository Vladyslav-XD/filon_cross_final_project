import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MocktailFinderScreen } from '../screens/MocktailFinderScreen';
import { RecipeDetailsScreen } from '../screens/RecipeDetailsScreen';
import { RandomScreen } from '../screens/RandomScreen';
import { SCREENS } from '../constants/screens';
import { colors } from '../theme/colors';

const Stack = createStackNavigator();

export const StackNavigator = () => {
  return (
    <Stack.Navigator
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
      }}
    >
      <Stack.Screen
        name={SCREENS.MOCKTAIL_FINDER}
        component={MocktailFinderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={SCREENS.RANDOM_TAB}
        component={RandomScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={SCREENS.RECIPE_DETAILS}
        component={RecipeDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
