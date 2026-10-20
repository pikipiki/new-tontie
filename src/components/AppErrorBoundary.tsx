import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Component, type ErrorInfo, type ReactNode } from 'react'

type AppErrorBoundaryProps = {
  children: ReactNode
  /** Shown in the heading when this boundary catches a failure. */
  context?: string
}

type AppErrorBoundaryState = {
  error: Error | null
}

function reloadPage(): void {
  window.location.reload()
}

function tryRuffleMode(): void {
  const url = new URL(window.location.href)
  url.searchParams.set('ruffle', '1')
  window.location.href = url.toString()
}

/**
 * Catches render errors and failed lazy chunks (no blank screen on mobile).
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      '[tontie]',
      this.props.context ?? 'app',
      error,
      info.componentStack,
    )
  }

  render(): ReactNode {
    const { error } = this.state
    return error ? renderFailureScreen(error) : this.props.children
  }
}

function renderFailureScreen(error: Error): ReactNode {
  const detail = import.meta.env.DEV ? error.message : undefined

  return (
    <Box
      role="alert"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        bgcolor: '#24123a',
        color: '#fffdf7',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <Box sx={{ maxWidth: 420 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 900, mb: 1 }}>
          Game could not start
        </Typography>
        <Typography sx={{ mb: 1, opacity: 0.95 }}>
          Игра не запустилась. Попробуйте обновить страницу или режим Flash
          ниже.
        </Typography>
        {detail ? (
          <Typography
            component="p"
            sx={{
              fontSize: 12,
              opacity: 0.75,
              wordBreak: 'break-word',
              mb: 2,
            }}
          >
            {detail}
          </Typography>
        ) : null}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: 'stretch',
          }}
        >
          <Button variant="contained" onClick={reloadPage}>
            Reload / Обновить
          </Button>
          <Button variant="outlined" color="inherit" onClick={tryRuffleMode}>
            Try Flash mode (?ruffle=1)
          </Button>
        </Box>
        <Typography sx={{ mt: 2, fontSize: 13, opacity: 0.8 }}>
          Wi‑Fi, Chrome updated, or try desktop site in Chrome menu.
        </Typography>
      </Box>
    </Box>
  )
}
