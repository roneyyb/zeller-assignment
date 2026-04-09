import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CreateUserScreen from '@/src/screens/CreateUserScreen';
import UsersHomeScreen from '@/src/screens/UsersHomeScreen';
import { useAppTheme } from '@/src/utils/theme';

export type RootStackParamList = {
  UsersHome: undefined;
  CreateUser: undefined;
  EditUser: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { colors } = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="UsersHome"
        component={UsersHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateUser"
        component={CreateUserScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditUser"
        component={CreateUserScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
