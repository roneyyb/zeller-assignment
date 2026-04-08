import type { UserQuery } from './userTypes';

export type BuiltUserListQuery = {
  sql: string;
  args: string[];
};

/**
 * Pure SQL builder for tests and reuse (no SQLite I/O).
 */
export function buildListUsersQuery(query: UserQuery = {}): BuiltUserListQuery {
  const where: string[] = [];
  const args: string[] = [];

  if (query.role?.trim()) {
    where.push(`LOWER(TRIM(COALESCE(role, ''))) = LOWER(TRIM(?))`);
    args.push(query.role.trim().toUpperCase());
  }

  if (query.search?.trim()) {
    // Requirement: text search to filter users by name.
    where.push(`name LIKE ?`);
    const like = `%${query.search.trim()}%`;
    args.push(like);
  }

  const sql = `
    SELECT id, name, email, role, updated_at
    FROM users
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY name COLLATE NOCASE ASC
  `.trim();

  return { sql, args };
}
