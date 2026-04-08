import { gql } from '@apollo/client';

import type { User } from '@/src/domain/user';
import { normalizeUsers } from '@/src/domain/user';

import { getApolloClient } from './apolloClient';

export type { User } from '@/src/domain/user';

type ListUsersVariables = {
  limit?: number;
  nextToken?: string | null;
  filter?: Record<string, unknown> | null;
};

/** AppSync response: root field remains `listZellerCustomers` (server schema). */
type ListUsersData = {
  listZellerCustomers: {
    items: (Record<string, unknown> | null)[] | null;
    nextToken: string | null;
  } | null;
};

const LIST_USERS = gql`
  query ListUsers(
    $filter: TableZellerCustomerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listZellerCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        role
      }
      nextToken
    }
  }
`;

export type ListUsersPageFn = (variables: ListUsersVariables) => Promise<{
  items: User[];
  nextToken: string | null;
}>;

export async function listUsersPage(variables: ListUsersVariables): Promise<{
  items: User[];
  nextToken: string | null;
}> {
  const client = getApolloClient();
  const { data } = await client.query<ListUsersData, ListUsersVariables>({
    query: LIST_USERS,
    variables,
  });

  if (!data) throw new Error('AppSync returned no data');

  const conn = data.listZellerCustomers;
  const items = normalizeUsers((conn?.items ?? []) as unknown[]);

  return {
    items,
    nextToken: conn?.nextToken ?? null,
  };
}

export async function listAllUsers(
  limit = 200,
  fetchPage: ListUsersPageFn = listUsersPage,
): Promise<User[]> {
  const out: User[] = [];
  let nextToken: string | null = null;

  do {
    const page = await fetchPage({ limit, nextToken });
    out.push(...page.items);
    nextToken = page.nextToken;
  } while (nextToken);

  return out;
}
