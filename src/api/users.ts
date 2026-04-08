import { gql } from '@apollo/client';

import { getApolloClient } from './apolloClient';

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

type ListUsersVariables = {
  limit?: number;
  nextToken?: string | null;
  filter?: Record<string, unknown> | null;
};

/** AppSync response: root field remains `listZellerCustomers` (server schema). */
type ListUsersData = {
  listZellerCustomers: {
    items: (User | null)[] | null;
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

export async function listUsersPage(variables: ListUsersVariables) {
  const client = getApolloClient();
  const { data } = await client.query<ListUsersData, ListUsersVariables>({
    query: LIST_USERS,
    variables,
  });

  if (!data) throw new Error('AppSync returned no data');

  const conn = data.listZellerCustomers;

  return {
    items: (conn?.items ?? []).filter(Boolean) as User[],
    nextToken: conn?.nextToken ?? null,
  };
}

export async function listAllUsers(limit = 200): Promise<User[]> {
  const out: User[] = [];
  let nextToken: string | null = null;

  do {
    const page = await listUsersPage({ limit, nextToken });
    out.push(...page.items);
    nextToken = page.nextToken;
  } while (nextToken);

  return out;
}
