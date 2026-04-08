import { useCallback, useMemo, useState } from 'react';

export type UsersHomeTabs = readonly string[];

export type UseUsersHomeStateOptions<TTab extends string> = {
  tabs: readonly TTab[];
  defaultTab: TTab;
  /** When search expands, force selection to this tab (commonly 'All'). */
  forceTabOnSearchOpen?: TTab;
  /** When search expands, hide segmented control. @default true */
  hideTabsWhenSearching?: boolean;
  /** When search opens, clear the search value. @default false */
  clearSearchOnOpen?: boolean;
  /** When tab changes, clear the search value. @default true */
  clearSearchOnTabChange?: boolean;
};

export function useUsersHomeState<TTab extends string>(
  options: UseUsersHomeStateOptions<TTab>,
) {
  const {
    tabs,
    defaultTab,
    forceTabOnSearchOpen,
    hideTabsWhenSearching = true,
    clearSearchOnOpen = false,
    clearSearchOnTabChange = true,
  } = options;

  const [selectedTab, setSelectedTab] = useState<TTab>(defaultTab);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const onTabChange = useCallback(
    (next: string) => {
      const t = (tabs.includes(next as TTab) ? (next as TTab) : defaultTab) as TTab;
      if (clearSearchOnTabChange) setSearch('');
      setSelectedTab(t);
    },
    [clearSearchOnTabChange, defaultTab, tabs],
  );

  const onSearchOpenChange = useCallback(
    (open: boolean) => {
      setSearchOpen(open);
      if (open) {
        if (clearSearchOnOpen) setSearch('');
        if (forceTabOnSearchOpen) setSelectedTab(forceTabOnSearchOpen);
      }
    },
    [clearSearchOnOpen, forceTabOnSearchOpen],
  );

  const showTabs = useMemo(() => !hideTabsWhenSearching || !searchOpen, [
    hideTabsWhenSearching,
    searchOpen,
  ]);

  return {
    selectedTab,
    setSelectedTab,
    search,
    setSearch,
    searchOpen,
    setSearchOpen,
    onTabChange,
    onSearchOpenChange,
    showTabs,
  };
}

