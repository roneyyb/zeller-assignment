import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SegmentedControl from './components/segmented-control/SegmentedControl';
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
  const [selectedOption, setSelectedOption] = useState('Option 1');

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <SegmentedControl
        options={['Option three', 'Option two', 'Option one']}
        selectedOption={selectedOption}
        onOptionPress={(option) => setSelectedOption(option)}
      />
      <HeaderSearch />
      <TopTabBar
        options={['All', 'Admin', 'Manager']}
        renderPage={(option) => {
          switch (option) {
            case 'Admin':
              return <AdminList />;
            case 'Manager':
              return <Text>Manager List</Text>;
            default:
              return <Text>All List</Text>;
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
