import { listAllUsers } from './users';

describe('listAllUsers', () => {
  it('paginates until nextToken is null', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce({
        items: [{ id: '1', name: 'a', email: null, role: 'A' }],
        nextToken: 'token-2',
      })
      .mockResolvedValueOnce({
        items: [{ id: '2', name: 'b', email: null, role: 'B' }],
        nextToken: null,
      });

    const all = await listAllUsers(10, fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage.mock.calls[0][0]).toEqual({ limit: 10, nextToken: null });
    expect(fetchPage.mock.calls[1][0]).toEqual({ limit: 10, nextToken: 'token-2' });
    expect(all.map((u) => u.id)).toEqual(['1', '2']);
  });
});
