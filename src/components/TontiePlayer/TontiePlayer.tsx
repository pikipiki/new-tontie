import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { CANONICAL_SWF, verifyCanonicalSwf } from '@/fidelity/swfManifest'

interface RufflePlayerElement extends HTMLElement {
  ruffle: () => { load: (url: string) => void }
}

declare global {
  interface Window {
    RufflePlayer?: {
      config?: { publicPath?: string }
      newest?: () => {
        createPlayer: () => RufflePlayerElement
      }
    }
  }
}

const SWF_URL = CANONICAL_SWF.url
const GAME_WIDTH = 400
const GAME_HEIGHT = 400

export function TontiePlayer() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [fidelityOk, setFidelityOk] = useState<boolean | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled

    void (async () => {
      const ok = await verifyCanonicalSwf()
      if (isCancelled()) {
        return
      }
      setFidelityOk(ok)
      if (!ok) {
        setLoadError(
          'SWF hash/size mismatch — run: cp reference/tontie.swf public/game/tontie.swf',
        )
        return
      }

      const ruffleGlobal = window.RufflePlayer ?? {}
      window.RufflePlayer = ruffleGlobal
      ruffleGlobal.config = { ...ruffleGlobal.config, publicPath: '/ruffle/' }

      await import('@ruffle-rs/ruffle')

      const host = hostRef.current
      if (!host || isCancelled()) {
        return
      }

      const newest = ruffleGlobal.newest
      if (!newest) {
        setLoadError('Ruffle failed to initialize')
        return
      }
      const factory = newest()

      const player = factory.createPlayer()
      player.style.width = `${String(GAME_WIDTH)}px`
      player.style.height = `${String(GAME_HEIGHT)}px`
      player.tabIndex = 0
      host.replaceChildren(player)
      player.ruffle().load(SWF_URL)
    })().catch(() => {
      if (!isCancelled()) {
        setLoadError('Failed to load Ruffle runtime')
      }
    })

    const hostAtMount = hostRef.current
    return () => {
      cancelled = true
      hostAtMount?.replaceChildren()
    }
  }, [])

  return (
    <Box>
      {fidelityOk === false && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {loadError}
        </Typography>
      )}
      <Box
        ref={hostRef}
        onPointerDown={() => {
          const el = hostRef.current?.querySelector('ruffle-player')
          if (el instanceof HTMLElement) {
            el.focus()
          }
        }}
        sx={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          mx: 'auto',
          border: '2px solid rgba(0,0,0,0.15)',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.12)',
          bgcolor: '#000',
          '&:focus-within': {
            outline: '3px solid #6c5ce7',
            outlineOffset: 4,
          },
        }}
      />
    </Box>
  )
}
