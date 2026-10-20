import { themeColors } from '@/components/Tontie3D/theme'

export const designTokens = {
  colors: {
    primary: themeColors.cabinetPink,
    secondary: themeColors.purple,
    background: themeColors.paper,
    paper: themeColors.paper,
    board: themeColors.cabinetPinkDeep,
    hole: themeColors.purpleDeep,
    text: themeColors.ink,
    textMuted: themeColors.purpleMuted,
    border: themeColors.playerBorder,
    success: themeColors.greenDeep,
    error: themeColors.redDeep,
    heroPink: themeColors.cabinetPink,
    enemyPurple: themeColors.purple,
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
