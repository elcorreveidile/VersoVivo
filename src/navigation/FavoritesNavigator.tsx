/**
 * Favorites Stack Navigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FavoritesScreen from '@screens/favorites/FavoritesScreen';
import PoemDetailScreen from '@screens/poem/PoemDetailScreen';
import type { FavoritesStackParamList } from '../types/navigation';

const Stack = createStackNavigator<FavoritesStackParamList>();

const FavoritesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      <Stack.Screen name="PoemDetail" component={PoemDetailScreen} />
    </Stack.Navigator>
  );
};

export default FavoritesNavigator;
