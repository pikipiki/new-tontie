import Box from '@mui/material/Box'
import { themeColors } from '@/components/Tontie3D/theme'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { GAME_HEIGHT, GAME_WIDTH, loadRufflePlayer } from './loadRufflePlayer'

export function TontiePlayer() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled

    const host = hostRef.current
    if (!host) {
      return
    }
    void loadRufflePlayer(host, isCancelled, setLoadError).catch(
      (error: unknown) => {
        if (!isCancelled()) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Failed to load Ruffle runtime',
          )
        }
      },
    )

    const hostAtMount = hostRef.current
    return () => {
      cancelled = true
      hostAtMount?.replaceChildren()
    }
  }, [])

  return (
    <Box component="main" aria-label="Original Flash game (Ruffle)">
      {loadError && (
        <Typography
          role="alert"
          color="error"
          variant="body2"
          sx={{ mb: 1, fontWeight: 700 }}
        >
          {loadError}
        </Typography>
      )}
      <Box
        ref={hostRef}
        role="application"
        aria-label="Tontie Flash player"
        onPointerDown={() => {
          const player = hostRef.current?.querySelector('ruffle-player')
          if (player instanceof HTMLElement) {
            player.focus()
          }
        }}
        sx={{
          width: GAME_WIDTH,
          height: 'auto',
          maxWidth: '100vw',
          aspectRatio: `${String(GAME_WIDTH)} / ${String(GAME_HEIGHT)}`,
          mx: 'auto',
          border: `2px solid ${themeColors.playerBorder}`,
          boxShadow: `4px 4px 0 ${themeColors.playerShadow}`,
          bgcolor: themeColors.black,
          '&:focus-within': {
            outline: `3px solid ${themeColors.focusPurple}`,
            outlineOffset: 4,
          },
        }}
      />
    </Box>
  )
}
