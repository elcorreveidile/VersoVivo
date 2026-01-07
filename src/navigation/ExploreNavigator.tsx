/**
 * Explore Stack Navigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExploreScreen from '@screens/explore/ExploreScreen';
import PoemDetailScreen from '@screens/poem/PoemDetailScreen';
import type { ExploreStackParamList } from '../types/navigation';

const Stack = createStackNavigator<ExploreStackParamList>();

const ExploreNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
      <Stack.Screen name="PoemDetail" component={PoemDetailScreen} />
    </Stack.Navigator>
  );
};

export default ExploreNavigator;
