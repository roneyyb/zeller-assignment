import { listAllUsers } from '@/src/api/users';
import { upsertUsers } from '@/src/database/sqlite/usersRepo';

export async function syncUsersFromNetwork() {
  const users = await listAllUsers(200);
  await upsertUsers(users);
  return users.length;
}
