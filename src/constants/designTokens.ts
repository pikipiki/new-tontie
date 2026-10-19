export const designTokens = {
  colors: {
    primary: '#e879a8',
    secondary: '#8b5cf6',
    background: '#f7e8ef',
    paper: '#fff5fa',
    board: '#f3b4d0',
    hole: '#5c2d6e',
    text: '#2d1b33',
    textMuted: '#6b4a75',
    border: 'rgba(45, 27, 51, 0.12)',
    success: '#2e7d32',
    error: '#c62828',
    heroPink: '#f4a6c8',
    enemyPurple: '#7c4dff',
  },
  radius: {
    md: '16px',
    sm: '10px',
  },
  fontFamily: [
    "'Source Sans 3'",
    '-apple-system',
    'BlinkMacSystemFont',
    "'Segoe UI'",
    'Roboto',
    'sans-serif',
  ].join(', '),
} as const

export const cssVarMap: Record<string, string> = {
  '--color-primary': designTokens.colors.primary,
  '--color-secondary': designTokens.colors.secondary,
  '--color-bg': designTokens.colors.background,
  '--color-paper': designTokens.colors.paper,
  '--color-text': designTokens.colors.text,
  '--font-family': designTokens.fontFamily,
}
