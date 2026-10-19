import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { lazy, Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TontieCanvas } from '@components/TontieCanvas/TontieCanvas'
import { Tontie3D } from '@components/Tontie3D/Tontie3D'

const TontiePlayer = lazy(() =>
  import('@components/TontiePlayer/TontiePlayer').then((m) => ({ default: m.TontiePlayer })),
)

const EYEZMAZE_URL = 'https://www.eyezmaze.com/game/tontie.html'

export function GamePage() {
  const { t } = useTranslation()
  const { ruffle, canvas2d } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { ruffle: false, canvas2d: false }
    }
    const q = new URLSearchParams(window.location.search)
    return {
      ruffle: q.get('ruffle') === '1',
      canvas2d: q.get('2d') === '1',
    }
  }, [])

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        py: 3,
        px: 2,
        bgcolor: '#e0d8b4',
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 520, mx: 'auto' }}>
        <Typography variant="h4" component="h1" sx={{ textAlign: 'center' }}>
          {t('title')}
        </Typography>
        <Typography sx={{ textAlign: 'center' }} color="text.secondary">
          {t('subtitle')}
        </Typography>
        {ruffle ? (
          <Suspense fallback={<Typography sx={{ textAlign: 'center' }}>Loading Ruffle…</Typography>}>
            <TontiePlayer />
          </Suspense>
        ) : canvas2d ? (
          <TontieCanvas />
        ) : (
          <Tontie3D />
        )}
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          {ruffle ? (
            <>
              Reference mode (original SWF).{' '}
              <Link href="/">Play 3D port</Link>
            </>
          ) : canvas2d ? (
            <>
              Canvas 2D legacy.{' '}
              <Link href="/">Back to 3D</Link>
              {' · '}
              <Link href="?ruffle=1">Ruffle reference</Link>
            </>
          ) : (
            <>
              3D port (Three.js + même moteur).{' '}
              <Link href="?2d=1">Canvas 2D</Link>
              {' · '}
              <Link href="?ruffle=1">Ruffle reference</Link>
            </>
          )}
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">{t('controls.numpad')}</Typography>
          <Typography variant="body2">{t('controls.focus')}</Typography>
          <Typography variant="body2">{t('controls.numlock')}</Typography>
          {!ruffle && !canvas2d && (
            <Typography variant="body2">
              Shop: 1–8 buy, ↑↓ select, Space buy, Enter leave level
            </Typography>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {t('attribution.prefix')}{' '}
          <Link href={EYEZMAZE_URL} target="_blank" rel="noreferrer">
            EYEZMAZE — Tontie v1
          </Link>
          {t('attribution.suffix')}
        </Typography>
      </Stack>
    </Box>
  )
}
