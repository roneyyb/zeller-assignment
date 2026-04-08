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
});
