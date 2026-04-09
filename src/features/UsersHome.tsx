import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TopTabBar from '@/src/components/tab-bar/TabBarTop';
import { useAppTheme } from '@/src/utils/theme';

import type { RootStackParamList } from '@/src/navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Search } from './Search';
import UsersList from './UsersList';
import { useUsersHomeState } from './useUsersHomeState';

const TABS = ['All', 'Admin', 'Manager'] as const;
type Tab = (typeof TABS)[number];

export default function UsersHome() {
  const { colors } = useAppTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const home = useUsersHomeState<Tab>({
    tabs: TABS,
    defaultTab: 'All',
    forceTabOnSearchOpen: 'All',
    hideTabsWhenSearching: true,
    clearSearchOnTabChange: true,
  });

  const pages = useMemo(
    () => ({
      Admin: <UsersList role="Admin" search={home.search} />,
      Manager: <UsersList role="Manager" search={home.search} />,
      All: <UsersList role="" search={home.search} showRole />,
    }),
    [home.search],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      <TopTabBar
        options={[...TABS]}
        selectedOption={home.selectedTab}
        onOptionChange={(next) => home.onTabChange(next)}
        renderPage={(option) => pages[option as Tab] ?? pages.All}
        hideHeaderLeft={!home.showTabs}
        pagerStyle={{ marginTop: 10 }}
        headerRight={
          <Search
            value={home.search}
            onChangeText={home.setSearch}
            onOpenChange={home.onSearchOpenChange}
            containerWidth={home.showTabs ? 44 : '100%'}
          />
        }
        segmented={{
          backgroundColor: colors.surface,
          showIndicator: true,
          indicatorColor: colors.surfaceElevated,
          indicatorBorderColor: colors.primary,
          indicatorBorderWidth: 2,

          activeTextColor: colors.primary,
          inactiveTextColor: colors.textSecondary,
          borderRadius: 100,
          height: 50,
          indicatorBorderRadius: 100,
          paddingVertical: 0,
          optionStyle: {
            paddingHorizontal: '15%',
          },
          indicatorStyle: {
            backgroundColor: colors.primary + '1A',
          },
          wrapperStyle: { flex: 1, marginRight: 16 },
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add user"
        onPress={() => navigation.navigate('CreateUser')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusVert: {
    position: 'absolute',
    width: 2,
    height: 18,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  plusHorz: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
});
