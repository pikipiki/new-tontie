import { AppErrorBoundary } from '@components/AppErrorBoundary'
import Box from '@mui/material/Box'
import { lazy, Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const Tontie3D = lazy(() =>
  import('@components/Tontie3D/Tontie3D').then((module) => ({
    default: module.Tontie3D,
  })),
)

const TontiePlayer = lazy(() =>
  import('@components/TontiePlayer/TontiePlayer').then((module) => ({
    default: module.TontiePlayer,
  })),
)

function GameLoading() {
  const { t } = useTranslation()
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#24123a',
        color: '#fffdf7',
        fontWeight: 800,
        fontSize: 18,
      }}
    >
      {t('a11y.loadingGame')}
    </Box>
  )
}

/** Game only. `?ruffle=1` keeps the original SWF reachable for side-by-side fidelity checks. */
export function GamePage() {
  const ruffle = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('ruffle') === '1',
    [],
  )

  if (ruffle) {
    return (
      <AppErrorBoundary context="ruffle">
        <Suspense fallback={<GameLoading />}>
          <TontiePlayer />
        </Suspense>
      </AppErrorBoundary>
    )
  }
  return (
    <AppErrorBoundary context="3d">
      <Suspense fallback={<GameLoading />}>
        <Tontie3D />
      </Suspense>
    </AppErrorBoundary>
  )
}
