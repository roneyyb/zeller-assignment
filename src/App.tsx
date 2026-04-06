import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppThemeProvider, useAppTheme } from './utils/theme';

function AppContent() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Zeller assignment
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Custom theme lives in{' '}
          <Text style={{ fontWeight: '600', color: colors.primary }}>
            src/theme
          </Text>
          . Edit <Text style={{ fontWeight: '600' }}>palette.ts</Text> and use{' '}
          <Text style={{ fontWeight: '600' }}>useAppTheme()</Text> in any
          screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <AppContent />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
});
