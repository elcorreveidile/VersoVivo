/**
 * Home Stack Navigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@screens/home/HomeScreen';
import PoemDetailScreen from '@screens/poem/PoemDetailScreen';
import type { HomeStackParamList } from '../types/navigation';

const Stack = createStackNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PoemDetail" component={PoemDetailScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
