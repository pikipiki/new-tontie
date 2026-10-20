import { createTheme } from '@mui/material/styles'
import { themeColors } from '@game3d/theme'
import { designTokens } from './designTokens'

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: designTokens.colors.primary },
    secondary: { main: designTokens.colors.secondary },
    background: {
      default: designTokens.colors.background,
      paper: designTokens.colors.paper,
    },
    text: {
      primary: designTokens.colors.text,
      secondary: designTokens.colors.textMuted,
    },
  },
  typography: {
    fontFamily: designTokens.fontFamily,
    body1: { lineHeight: 1.5 },
    body2: { lineHeight: 1.5 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          '&.Mui-focusVisible': {
            outline: `3px solid ${themeColors.focusHighContrast}`,
            outlineOffset: 3,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        ':focus:not(:focus-visible)': {
          outline: 'none',
        },
        'a:focus-visible, button:focus-visible': {
          outline: `3px solid ${themeColors.focusHighContrast}`,
          outlineOffset: 3,
        },
      },
    },
  },
})
