import { createTheme } from '@mui/material/styles'
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
  },
  shape: {
    borderRadius: 16,
  },
})
