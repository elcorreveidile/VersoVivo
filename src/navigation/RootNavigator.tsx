/**
 * Root Navigator
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '@hooks/index';
import { getCurrentUser } from '@store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import type { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Check if user is already logged in
    dispatch(getCurrentUser());
  }, [dispatch]);

  if (isLoading) {
    // You can replace this with a proper loading screen component
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
