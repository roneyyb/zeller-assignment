import { User } from '@/src/api/users';

import { getDb } from './db';

// expo-sqlite allows only one active transaction per connection.
// In dev, effects can run twice and trigger concurrent syncs; serialize writes to avoid:
// "cannot start a transaction within a transaction".
let writeChain: Promise<void> = Promise.resolve();

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  updated_at: number;
};

export type UserQuery = {
  role?: string | null;
  search?: string;
};

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

  const where: string[] = [];
  const args: string[] = [];

  if (query.role?.trim()) {
    // API may store `ADMIN` / `MANAGER` while UI uses `Admin` / `Manager`.
    where.push(`LOWER(TRIM(COALESCE(role, ''))) = LOWER(TRIM(?))`);
    args.push(query.role.trim().toUpperCase());
  }

  if (query.search?.trim()) {
    where.push(`(name LIKE ? OR email LIKE ?)`);
    const like = `%${query.search.trim()}%`;
    args.push(like, like);
  }

  const sql = `
    SELECT id, name, email, role, updated_at
    FROM users
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY name COLLATE NOCASE ASC
  `;

  return (await db.getAllAsync(sql, args)) as UserRow[];
}
