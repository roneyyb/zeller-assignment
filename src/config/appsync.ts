export type AppSyncConfig = {
  endpoint: string;
  apiKey: string;
  region?: string;
};

/**
 * AppSync client config.
 *
 * Note: API keys are not secrets in a mobile app bundle. Do not commit real keys.
 * Provide them via `.env` for local dev and rotate if leaked.
 */
export function getAppSyncConfig(): AppSyncConfig {
  const endpoint = process.env.EXPO_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT;
  const apiKey = process.env.EXPO_PUBLIC_APPSYNC_API_KEY;
  const region = process.env.EXPO_PUBLIC_APPSYNC_REGION;

  if (!endpoint || !apiKey) {
    throw new Error(
      'Missing AppSync config. Set EXPO_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT and EXPO_PUBLIC_APPSYNC_API_KEY in .env',
    );
  }

  return { endpoint, apiKey, region };
}
