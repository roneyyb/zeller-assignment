import type { User } from '@/src/domain/user';
import { listAllUsers } from '@/src/api/users';
import { upsertUsers } from '@/src/database/sqlite/usersRepo';

export type SyncUsersDeps = {
  listAllUsers: (limit?: number) => Promise<User[]>;
  upsertUsers: (users: User[], now?: number) => Promise<void>;
};

export function createSyncUsersFromNetwork(deps: SyncUsersDeps) {
  return async function syncUsersFromNetwork(): Promise<number> {
    const users = await deps.listAllUsers(200);
    await deps.upsertUsers(users);
    return users.length;
  };
}

export const syncUsersFromNetwork = createSyncUsersFromNetwork({
  listAllUsers,
  upsertUsers,
});
