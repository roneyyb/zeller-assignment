import { buildListUsersQuery } from './buildListUsersQuery';

describe('buildListUsersQuery', () => {
  it('returns unconditional select when no filters', () => {
    const { sql, args } = buildListUsersQuery({});
    expect(args).toEqual([]);
    expect(sql).toContain('FROM users');
    expect(sql).not.toContain('WHERE');
  });

  it('adds case-normalized role filter', () => {
    const { sql, args } = buildListUsersQuery({ role: ' Admin ' });
    expect(sql).toContain('WHERE');
    expect(sql).toContain('LOWER(TRIM(COALESCE(role');
    expect(args).toEqual(['ADMIN']);
  });

  it('adds search on name', () => {
    const { sql, args } = buildListUsersQuery({ search: 'lee' });
    expect(sql).toContain('name LIKE ?');
    expect(sql).not.toContain('email LIKE ?');
    expect(args).toEqual(['%lee%']);
  });

  it('combines role and search with AND', () => {
    const { sql, args } = buildListUsersQuery({ role: 'Manager', search: '@' });
    expect(sql).toContain('AND');
    expect(args).toEqual(['MANAGER', '%@%']);
  });

  it('ignores blank search and role', () => {
    const { sql, args } = buildListUsersQuery({ role: '   ', search: '  ' });
    expect(sql).not.toContain('WHERE');
    expect(args).toEqual([]);
  });
});
