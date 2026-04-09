import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './navigation/AppNavigator';
import { AppThemeProvider, useAppTheme } from './utils/theme';

export default function App() {
  return (
    <AppThemeProvider>
      <AppShell />
    </AppThemeProvider>
  );
}

function AppShell() {
  const theme = useAppTheme();
  return (
    <GestureHandlerRootView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaProvider>
        <ThemedStatusBar />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStatusBar() {
  const theme = useAppTheme();
  return (
    <StatusBar
      style={theme.isDark ? 'light' : 'dark'}
      backgroundColor={theme.colors.background}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
