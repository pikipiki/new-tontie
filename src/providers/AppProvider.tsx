import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useLayoutEffect } from 'react'
import { applyDesignTokens } from '@constants/applyDesignTokens'
import { muiTheme } from '@constants/muiTheme'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  useLayoutEffect(() => {
    applyDesignTokens()
  }, [])

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
