import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkPalette, lightPalette, type ColorPalette } from './palette';

export type AppColorScheme = 'light' | 'dark';

export type AppTheme = {
  colors: ColorPalette;
  scheme: AppColorScheme;
  isDark: boolean;
};

const AppThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const scheme: AppColorScheme = system === 'dark' ? 'dark' : 'light';

  const value = useMemo<AppTheme>(
    () => ({
      colors: scheme === 'dark' ? darkPalette : lightPalette,
      scheme,
      isDark: scheme === 'dark',
    }),
    [scheme],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}
