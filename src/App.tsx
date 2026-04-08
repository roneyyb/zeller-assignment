import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TopTabBar from './components/tab-bar/TabBarTop';
import AdminList from './features/AdminList';
import { AppThemeProvider, useAppTheme } from './utils/theme';

import SearchBarExpandWithButton from '@/src/components/search-bar/SearchBarExpandWithButton';

export function HeaderSearch() {
  const [q, setQ] = useState('');
  return (
    <SearchBarExpandWithButton
      value={q}
      onChangeText={setQ}
      placeholder="Search users"
      onSubmit={() => console.log('submit', q)}
      containerStyle={{ alignItems: 'flex-end' }}
    />
  );
}

function AppContent() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <HeaderSearch />
      <TopTabBar
        options={['All', 'Admin', 'Manager']}
        // selectedOption={selectedOption}
        //  onOptionPress={(option) => setSelectedOption(option)}
        renderPage={(option) => {
          switch (option) {
            case 'Admin':
              return (
                <View style={{ flex: 1 }}>
                  <AdminList role="Admin" />
                </View>
              );

            case 'Manager':
              return (
                <View style={{ flex: 1 }}>
                  <AdminList role="Manager" />
                </View>
              );
            default:
              return (
                <View style={{ flex: 1 }}>
                  <AdminList role="" />
                </View>
              );
          }
        }}
      />
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
