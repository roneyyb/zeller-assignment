import { useCallback, useEffect, useMemo, useState } from 'react';

import { UserRow, listUsers } from '@/src/database/sqlite/usersRepo';
import { syncUsersFromNetwork } from '@/src/services/syncUsers';

export type UseUsersParams = {
  role?: string | null;
  search?: string;
};

export function useUsers({ role = null, search = '' }: UseUsersParams) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => ({ role, search }), [role, search]);

  const reloadFromDb = useCallback(async () => {
    const next = await listUsers(query);
    setRows(next);
  }, [query]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await syncUsersFromNetwork();
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
}
