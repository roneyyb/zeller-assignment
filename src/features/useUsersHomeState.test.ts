import { act, renderHook } from '@testing-library/react-native';

import { useUsersHomeState } from './useUsersHomeState';

describe('useUsersHomeState', () => {
  it('forces tab to All and hides tabs when search opens (configurable)', () => {
    const { result } = renderHook(() =>
      useUsersHomeState({
        tabs: ['All', 'Admin', 'Manager'] as const,
        defaultTab: 'Admin',
        forceTabOnSearchOpen: 'All',
        hideTabsWhenSearching: true,
        clearSearchOnTabChange: true,
      }),
    );

    act(() => {
      result.current.onTabChange('Manager');
      result.current.setSearch('Ada');
    });

    expect(result.current.selectedTab).toBe('Manager');
    expect(result.current.search).toBe('Ada');
    expect(result.current.showTabs).toBe(true);

    act(() => {
      result.current.onSearchOpenChange(true);
    });

    expect(result.current.searchOpen).toBe(true);
    expect(result.current.selectedTab).toBe('All');
    expect(result.current.showTabs).toBe(false);
  });

  it('clears search on tab change when enabled', () => {
    const { result } = renderHook(() =>
      useUsersHomeState({
        tabs: ['All', 'Admin'] as const,
        defaultTab: 'All',
        clearSearchOnTabChange: true,
      }),
    );

    act(() => {
      result.current.setSearch('abc');
      result.current.onTabChange('Admin');
    });

    expect(result.current.selectedTab).toBe('Admin');
    expect(result.current.search).toBe('');
  });
});

