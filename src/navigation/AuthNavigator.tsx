/**
 * Authentication Navigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@screens/auth/LoginScreen';
import SignupScreen from '@screens/auth/SignupScreen';
import InvitationReserveScreen from '@screens/invitations/InvitationReserveScreen';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  InvitationReserve: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="InvitationReserve" component={InvitationReserveScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
