# Zeller React Native Code Challenge

Offline-first React Native (Expo) app that:
- Fetches users via AppSync GraphQL `listZellerCustomers`
- Persists into local **SQLite** for offline usage
- Displays from SQLite (DB is source of truth)
- Supports create, edit, delete (local only), role filtering, and name search

## Tech stack
- **Expo / React Native** (TypeScript)
- **Apollo Client** for GraphQL
- **expo-sqlite** for local persistence
- **react-hook-form + zod** for form validation
- **Jest + @testing-library/react-native** for tests

## Environment variables
This project uses Expo env vars (`EXPO_PUBLIC_*`).

1. Create a `.env` file:

```bash
cp .env.example .env
```

2. Fill in AppSync values (from `aws-exports.js` you were provided in the challenge):
- `EXPO_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT`
- `EXPO_PUBLIC_APPSYNC_API_KEY`
- `EXPO_PUBLIC_APPSYNC_REGION` (optional)

> Note: API keys are not secrets in a mobile bundle. Don’t commit real keys.

## Install & run (Yarn — evaluator friendly)

```bash
yarn install
yarn ios
# or
yarn android
```

Start Metro only (no emulator boot):

```bash
yarn start
```

## Install & run (Bun — optional)

```bash
bun install
bun run ios
# or
bun run android
```

## Tests

```bash
yarn test
# or
bun run test
```

## Project notes

### Offline-first data flow
Network is only used to sync; UI reads from SQLite.

- GraphQL fetch: `src/api/users.ts` (`listUsersPage`, `listAllUsers`)
- Sync service: `src/services/syncUsers.ts`
- SQLite repo: `src/database/sqlite/usersRepo.ts`
- UI hook: `src/features/useUsers.ts`

### Create/Edit/Delete
- Screen: `src/screens/CreateUserScreen.tsx` (handles create + edit routes)
- Shared form UI/logic: `src/screens/UpsertUserScreenBase.tsx`
- List → edit navigation: tap a row in `src/features/UsersList.tsx`

### Validation rules
- First/last name: required, alphabets/spaces only, max 50 chars, must start with a capital letter
- Email: optional; if provided, must be valid

## Common commands

```bash
yarn lint
yarn test
```

## Troubleshooting
- If you see “Missing AppSync config…” ensure `.env` has `EXPO_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT` and `EXPO_PUBLIC_APPSYNC_API_KEY`.

