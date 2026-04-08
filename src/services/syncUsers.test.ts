import type { User } from '@/src/domain/user';

import { createSyncUsersFromNetwork } from './syncUsers';

describe('createSyncUsersFromNetwork', () => {
  it('fetches, upserts, returns count', async () => {
    const users: User[] = [
      { id: '1', name: 'One', email: null, role: 'ADMIN' },
    ];
    const listAllUsers = jest.fn().mockResolvedValue(users);
    const upsertUsers = jest.fn().mockResolvedValue(undefined);

    const sync = createSyncUsersFromNetwork({ listAllUsers, upsertUsers });

    await expect(sync()).resolves.toBe(1);
    expect(listAllUsers).toHaveBeenCalledWith(200);
    expect(upsertUsers).toHaveBeenCalledWith(users);
  });
});
