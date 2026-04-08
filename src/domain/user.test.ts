import { normalizeUser, normalizeUsers } from './user';

describe('normalizeUser', () => {
  it('returns null for invalid input', () => {
    expect(normalizeUser(null)).toBeNull();
    expect(normalizeUser(undefined)).toBeNull();
    expect(normalizeUser({})).toBeNull();
    expect(normalizeUser({ id: 1 })).toBeNull();
  });

  it('maps GraphQL-shaped objects and ignores __typename', () => {
    expect(
      normalizeUser({
        __typename: 'ZellerCustomer',
        id: 'a',
        name: 'Ada',
        email: 'a@x.com',
        role: 'ADMIN',
      }),
    ).toEqual({
      id: 'a',
      name: 'Ada',
      email: 'a@x.com',
      role: 'ADMIN',
    });
  });

  it('coerces null fields', () => {
    expect(
      normalizeUser({
        id: 'b',
        name: null,
        email: null,
        role: null,
      }),
    ).toEqual({
      id: 'b',
      name: null,
      email: null,
      role: null,
    });
  });
});

describe('normalizeUsers', () => {
  it('filters nulls', () => {
    const items = [
      { id: '1', name: 'One', email: null, role: 'A' },
      null,
      { id: '2', name: 'Two', email: 'e@e.com', role: 'B' },
    ];
    expect(normalizeUsers(items as unknown[])).toHaveLength(2);
  });
});
