/**
 * Profile Stack Navigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '@screens/profile/ProfileScreen';
import SettingsScreen from '@screens/profile/SettingsScreen';
import AboutScreen from '@screens/profile/AboutScreen';
import type { ProfileStackParamList } from '../types/navigation';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
