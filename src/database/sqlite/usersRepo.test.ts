/* eslint-disable import/first -- mock getDb before importing usersRepo */
jest.mock('./db', () => ({
  getDb: jest.fn(),
}));

import { getDb } from './db';
import { deleteUser, getUserById, updateUser, upsertUsers } from './usersRepo';

type FakeDb = {
  withTransactionAsync: (fn: () => Promise<void>) => Promise<void>;
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
};

const mockedGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe('usersRepo', () => {
  beforeEach(() => {
    mockedGetDb.mockReset();
  });

  it('getUserById returns first row or null', async () => {
    const db: FakeDb = {
      withTransactionAsync: async (fn) => fn(),
      runAsync: jest.fn(),
      getAllAsync: jest.fn().mockResolvedValue([
        { id: '1', name: 'Ada', email: null, role: 'ADMIN', updated_at: 1 },
      ]),
    };
    mockedGetDb.mockResolvedValue(db as never);

    await expect(getUserById('1')).resolves.toEqual({
      id: '1',
      name: 'Ada',
      email: null,
      role: 'ADMIN',
      updated_at: 1,
    });

    db.getAllAsync.mockResolvedValueOnce([]);
    await expect(getUserById('missing')).resolves.toBeNull();
  });

  it('updateUser delegates to upsertUsers behavior (runs insert statement)', async () => {
    const db: FakeDb = {
      withTransactionAsync: async (fn) => fn(),
      runAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn(),
    };
    mockedGetDb.mockResolvedValue(db as never);

    await updateUser({
      id: '1',
      name: 'Ada Lovelace',
      email: null,
      role: 'ADMIN',
      now: 123,
    });

    expect(db.runAsync).toHaveBeenCalled();
    const sql = db.runAsync.mock.calls[0]?.[0] as string;
    expect(sql).toContain('INSERT INTO users');
    expect(sql).toContain('ON CONFLICT(id) DO UPDATE');
  });

  it('deleteUser runs delete inside a transaction', async () => {
    const db: FakeDb = {
      withTransactionAsync: jest.fn(async (fn) => fn()),
      runAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn(),
    };
    mockedGetDb.mockResolvedValue(db as never);

    await deleteUser('1');

    expect(db.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(db.runAsync).toHaveBeenCalledWith(`DELETE FROM users WHERE id = ?`, ['1']);
  });

  it('serializes concurrent writes via writeChain', async () => {
    const order: string[] = [];
    const db: FakeDb = {
      withTransactionAsync: async (fn) => fn(),
      runAsync: jest.fn(async (_sql, args) => {
        order.push(String(args?.[0] ?? ''));
        // simulate async work
        await Promise.resolve();
      }),
      getAllAsync: jest.fn(),
    };
    mockedGetDb.mockResolvedValue(db as never);

    const p1 = upsertUsers([{ id: '1', name: 'A', email: null, role: 'ADMIN' } as any], 1);
    const p2 = upsertUsers([{ id: '2', name: 'B', email: null, role: 'ADMIN' } as any], 1);
    await Promise.all([p1, p2]);

    expect(order).toEqual(['1', '2']);
  });
});

