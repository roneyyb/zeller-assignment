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
  // Extracted from design reference screenshot (approx).
  background: '#ffffff',
  // Used for segmented controls / subtle panels
  surface: '#f3f4f6',
  // Used for cards / list rows
  surfaceElevated: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#4d5151',
  primary: '#0b67b2',
  onPrimary: '#ffffff',
  border: '#e5e7eb',
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
