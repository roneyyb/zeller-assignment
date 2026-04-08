import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { getAppSyncConfig } from '../config/appsync';

let client: ApolloClient | null = null;

export function getApolloClient() {
  if (client) return client;

  const { endpoint, apiKey } = getAppSyncConfig();

  const httpLink = new HttpLink({
    uri: endpoint,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'x-api-key': apiKey,
      },
    };
  });

  client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache', // DB is source of truth; avoid Apollo cache confusion
      },
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
    },
  });

  return client;
}

