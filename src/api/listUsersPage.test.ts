jest.mock('./apolloClient', () => ({
  getApolloClient: jest.fn(),
}));

import { getApolloClient } from './apolloClient';
import { listUsersPage } from './users';

const mockedGetApolloClient = getApolloClient as jest.MockedFunction<
  typeof getApolloClient
>;

describe('listUsersPage', () => {
  it('maps AppSync response to normalized users and nextToken', async () => {
    const query = jest.fn().mockResolvedValue({
      data: {
        listZellerCustomers: {
          items: [
            {
              __typename: 'ZellerCustomer',
              id: '1',
              name: 'Ada',
              email: 'ada@example.com',
              role: 'ADMIN',
            },
            null,
          ],
          nextToken: 'next-1',
        },
      },
    });

    mockedGetApolloClient.mockReturnValue({ query } as never);

    const page = await listUsersPage({ limit: 10, nextToken: null });

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { limit: 10, nextToken: null },
      }),
    );
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toEqual({
      id: '1',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'ADMIN',
    });
    expect(page.nextToken).toBe('next-1');
  });

  it('throws when AppSync returns no data', async () => {
    const query = jest.fn().mockResolvedValue({ data: null });
    mockedGetApolloClient.mockReturnValue({ query } as never);

    await expect(listUsersPage({})).rejects.toThrow('AppSync returned no data');
  });
});
