/**
 * Main Tab Navigator
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '@theme/index';
import HomeNavigator from './HomeNavigator';
import ExploreNavigator from './ExploreNavigator';
import FavoritesNavigator from './FavoritesNavigator';
import ProfileNavigator from './ProfileNavigator';
import type { MainTabParamList } from '@types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.dark,
          borderTopColor: colors.primary.darkGold,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary.gold,
        tabBarInactiveTintColor: colors.text.darkSecondary,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreNavigator}
        options={{
          tabBarLabel: 'Explorar',
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesNavigator}
        options={{
          tabBarLabel: 'Favoritos',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
