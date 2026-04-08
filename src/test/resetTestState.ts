import { resetApolloClientForTests } from '@/src/api/apolloClient';
import { resetSqliteForTests } from '@/src/database/sqlite/db';
import { resetUsersWriteChainForTests } from '@/src/database/sqlite/usersRepo';

/**
 * Call in `afterEach` for tests that touch Apollo or SQLite singletons.
 */
export function resetAppSingletonsForTests(): void {
  resetApolloClientForTests();
  resetSqliteForTests();
  resetUsersWriteChainForTests();
}
