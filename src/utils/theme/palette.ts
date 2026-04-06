/**
 * Design tokens for light / dark. Add or rename keys here — keep both palettes in sync.
 */
export type ColorPalette = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  border: string;
  error: string;
  success: string;
};

export const lightPalette: ColorPalette = {
  background: '#ffffff',
  surface: '#f4f4f5',
  surfaceElevated: '#e4e4e7',
  text: '#11181c',
  textSecondary: '#3f3f46',
  textMuted: '#71717a',
  primary: '#0a7ea4',
  onPrimary: '#ffffff',
  border: '#e4e4e7',
  error: '#dc2626',
  success: '#16a34a',
};

export const darkPalette: ColorPalette = {
  background: '#151718',
  surface: '#1c1f21',
  surfaceElevated: '#252a2d',
  text: '#ecedee',
  textSecondary: '#c4c9cc',
  textMuted: '#9ba1a6',
  primary: '#38bdf8',
  onPrimary: '#0c1222',
  border: '#2d3336',
  error: '#f87171',
  success: '#4ade80',
};
