import type { User } from '@/src/domain/user';

import { buildListUsersQuery } from './buildListUsersQuery';
import { getDb } from './db';
import type { UserQuery, UserRow } from './userTypes';

export type { UserQuery, UserRow } from './userTypes';

// expo-sqlite allows only one active transaction per connection.
let writeChain: Promise<void> = Promise.resolve();

/** Test helper: reset serialized write queue between tests. */
export function resetUsersWriteChainForTests(): void {
  writeChain = Promise.resolve();
}

export async function upsertUsers(users: User[], now = Date.now()) {
  writeChain = writeChain.then(async () => {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      for (const u of users) {
        await db.runAsync(
          `INSERT INTO users (id, name, email, role, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name,
             email=excluded.email,
             role=excluded.role,
             updated_at=excluded.updated_at
          `,
          [u.id, u.name ?? null, u.email ?? null, u.role ?? null, now],
        );
      }
    });
  });

  return writeChain;
}

export async function listUsers(query: UserQuery = {}): Promise<UserRow[]> {
  const db = await getDb();
  const { sql, args } = buildListUsersQuery(query);
  return (await db.getAllAsync(sql, args)) as UserRow[];
}

export async function createUser(input: {
  id: string;
  name: string;
  email: string | null;
  role: string;
  now?: number;
}) {
  const now = input.now ?? Date.now();
  return upsertUsers(
    [
      {
        id: input.id,
        name: input.name,
        email: input.email,
        role: input.role,
      },
    ],
    now,
  );
}
