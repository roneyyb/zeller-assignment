/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** @see https://docs.expo.dev/guides/environment-variables/ */
    EXPO_PUBLIC_APP_ENV?: 'development' | 'staging' | 'production';
    EXPO_PUBLIC_API_URL?: string;
  }
}
