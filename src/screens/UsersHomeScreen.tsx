import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TopTabBar from '@/src/components/tab-bar/TabBarTop';
import type { RootStackParamList } from '@/src/navigation/AppNavigator';
import { useAppTheme } from '@/src/utils/theme';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Search } from '@/src/features/Search';
import UsersList from '@/src/features/UsersList';
import { useUsersHomeState } from '@/src/features/useUsersHomeState';

const TABS = ['All', 'Admin', 'Manager'] as const;
type Tab = (typeof TABS)[number];

export default function UsersHomeScreen() {
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

  const [reloadKey, setReloadKey] = useState(0);
  const didFocusOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!didFocusOnce.current) {
        didFocusOnce.current = true;
        return;
      }
      setReloadKey((k) => k + 1);
    }, []),
  );

  const pages = useMemo(
    () => ({
      Admin: (
        <UsersList
          role="Admin"
          search={home.search}
          reloadKey={reloadKey}
          onUserPress={(id) => navigation.navigate('EditUser', { id })}
        />
      ),
      Manager: (
        <UsersList
          role="Manager"
          search={home.search}
          reloadKey={reloadKey}
          onUserPress={(id) => navigation.navigate('EditUser', { id })}
        />
      ),
      All: (
        <UsersList
          role=""
          search={home.search}
          showRole
          reloadKey={reloadKey}
          onUserPress={(id) => navigation.navigate('EditUser', { id })}
        />
      ),
    }),
    [home.search, navigation, reloadKey],
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
        containerStyle={{ paddingTop: 10 }}
        headerHeight={55}
        headerRight={
          <Search
            value={home.search}
            onChangeText={home.setSearch}
            onOpenChange={home.onSearchOpenChange}
            containerWidth={home.showTabs ? 60 : '100%'}
            height={55}
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
          height: 60,
          indicatorBorderRadius: 100,
          paddingVertical: 0,
          optionStyle: {
            paddingHorizontal: '12%',
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
});
