import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { UserQuery, UserRow } from '@/src/database/sqlite/userTypes';
import { listUsers } from '@/src/database/sqlite/usersRepo';
import { syncUsersFromNetwork } from '@/src/services/syncUsers';

export type UserDataDeps = {
  listFromDb: (query: UserQuery) => Promise<UserRow[]>;
  syncFromNetwork: () => Promise<number>;
};

export type UseUsersParams = {
  role?: string | null;
  search?: string;
};

export function createUseUsers(deps: UserDataDeps) {
  return function useUsers({ role = null, search = '' }: UseUsersParams) {
    const depsRef = useRef(deps);
    depsRef.current = deps;

    const [rows, setRows] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const query = useMemo(() => ({ role, search }), [role, search]);

    const reloadFromDb = useCallback(async () => {
      const next = await depsRef.current.listFromDb(query);
      setRows(next);
    }, [query]);

    const refresh = useCallback(async () => {
      setRefreshing(true);
      setError(null);
      try {
        await depsRef.current.syncFromNetwork();
        await reloadFromDb();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to refresh users');
      } finally {
        setRefreshing(false);
      }
    }, [reloadFromDb]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          await reloadFromDb();
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [reloadFromDb]);

    return { rows, loading, refreshing, error, refresh, reloadFromDb };
  };
}

const defaultDeps: UserDataDeps = {
  listFromDb: listUsers,
  syncFromNetwork: syncUsersFromNetwork,
};

export const useUsers = createUseUsers(defaultDeps);
