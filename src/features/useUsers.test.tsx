import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createUseUsers } from './useUsers';

describe('createUseUsers', () => {
  it('loads rows from listFromDb on mount', async () => {
    const listFromDb = jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Ada',
        email: null,
        role: 'ADMIN',
        updated_at: 1,
      },
    ]);
    const syncFromNetwork = jest.fn().mockResolvedValue(1);
    const useTestUsers = createUseUsers({ listFromDb, syncFromNetwork });

    const { result } = renderHook(() => useTestUsers({ role: 'Admin' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listFromDb).toHaveBeenCalledWith({ role: 'Admin', search: '' });
    expect(result.current.rows).toHaveLength(1);
    expect(syncFromNetwork).not.toHaveBeenCalled();
  });

  it('refresh runs sync then reload', async () => {
    const listFromDb = jest.fn().mockResolvedValue([]);
    const syncFromNetwork = jest.fn().mockResolvedValue(2);
    const useTestUsers = createUseUsers({ listFromDb, syncFromNetwork });
    const { result } = renderHook(() => useTestUsers({}));

    await waitFor(() => expect(result.current.loading).toBe(false));
    listFromDb.mockClear();

    await act(async () => {
      await result.current.refresh();
    });

    expect(syncFromNetwork).toHaveBeenCalledTimes(1);
    expect(listFromDb).toHaveBeenCalled();
  });

  it('refresh sets error when sync fails', async () => {
    const listFromDb = jest.fn().mockResolvedValue([]);
    const syncFromNetwork = jest
      .fn()
      .mockRejectedValue(new Error('Network unavailable'));
    const useTestUsers = createUseUsers({ listFromDb, syncFromNetwork });
    const { result } = renderHook(() => useTestUsers({}));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBe('Network unavailable');
    expect(result.current.refreshing).toBe(false);
  });

  it('refresh sets generic error when sync rejects non-Error', async () => {
    const listFromDb = jest.fn().mockResolvedValue([]);
    const syncFromNetwork = jest.fn().mockRejectedValue('boom');
    const useTestUsers = createUseUsers({ listFromDb, syncFromNetwork });
    const { result } = renderHook(() => useTestUsers({}));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBe('Failed to refresh users');
  });

  it('reloads from db when search param changes', async () => {
    const listFromDb = jest.fn().mockResolvedValue([]);
    const syncFromNetwork = jest.fn();
    const useTestUsers = createUseUsers({ listFromDb, syncFromNetwork });

    const { rerender } = renderHook(
      ({ search }: { search: string }) => useTestUsers({ search }),
      { initialProps: { search: 'a' } },
    );

    await waitFor(() => expect(listFromDb).toHaveBeenCalled());
    expect(listFromDb).toHaveBeenCalledWith({ role: null, search: 'a' });

    listFromDb.mockClear();
    rerender({ search: 'b' });

    await waitFor(() =>
      expect(listFromDb).toHaveBeenCalledWith({ role: null, search: 'b' }),
    );
  });
});
