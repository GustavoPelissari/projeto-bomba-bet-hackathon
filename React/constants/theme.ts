// Tokens de design do app (tema escuro + dourado). Sempre importar daqui em vez de
// usar cores/valores hardcoded nas telas.
export const theme = {
  colors: {
    bg: '#0B0B0C',
    surface: '#161618',
    surfaceAlt: '#1F1F23',
    border: '#2E2E33',
    textPrimary: '#FFFFFF',
    textSecondary: '#CED2D8',
    accent: '#FFC107',
    accentText: '#0B0B0C',
    success: '#5EE6A0',
    danger: '#FF8A8A',
    live: '#FF8A8A',
    scheduled: '#CED2D8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  font: {
    h1: { fontSize: 24, fontWeight: '700' as const },
    h2: { fontSize: 20, fontWeight: '700' as const },
    title: { fontSize: 17, fontWeight: '600' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    label: { fontSize: 13, fontWeight: '500' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
  },
} as const;

export type Theme = typeof theme;
