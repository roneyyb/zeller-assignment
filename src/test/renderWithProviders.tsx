import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';

import { AppThemeProvider } from '@/src/utils/theme';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AppThemeProvider>{children}</AppThemeProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
