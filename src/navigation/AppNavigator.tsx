import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import UsersHome from '@/src/features/UsersHome';
import CreateUserScreen from '@/src/screens/CreateUserScreen';

export type RootStackParamList = {
  UsersHome: undefined;
  CreateUser: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UsersHome"
        component={UsersHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateUser"
        component={CreateUserScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
