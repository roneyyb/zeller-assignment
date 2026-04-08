import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let migratePromise: Promise<void> | null = null;

/** Test helper: clear singletons so the next `getDb()` opens a fresh handle. */
export function resetSqliteForTests(): void {
  dbPromise = null;
  migratePromise = null;
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('users.db');
  }
  const db = await dbPromise;
  await migrate();
  return db;
}

export async function migrate() {
  if (migratePromise) return migratePromise;

  migratePromise = (async () => {
    if (!dbPromise) {
      dbPromise = SQLite.openDatabaseAsync('users.db');
    }
    const db = await dbPromise;

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT,
        role TEXT,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
    `);
  })().catch((e) => {
    migratePromise = null;
    throw e;
  });

  return migratePromise;
}
