import './tontiePreload'
import Box from '@mui/material/Box'
import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { isMuted, setMuted } from '@game/audio'
import { GameFxContext } from '@game3d/fx'
import { BASE_FOV, CAMERA_POSITION } from '@game3d/layout3d'
import { TontieScene3D } from '@game3d/TontieScene3D'
import { useTontieGame } from '@/hooks/useTontieGame'
import { SKY } from './theme'
import { BottomBar, Banner, DamageFlash, TopBar } from './TontieHud'
import { useHighScore } from './tontieHudScore'
import { HoleButtons, Overlays } from './TontieOverlays'

function blockContextMenu(event: MouseEvent) {
  event.preventDefault()
}

export function Tontie3D() {
  const { t } = useTranslation()
  const game = useTontieGame()
  const high = useHighScore(game.state.score)
  const [photo] = useState(
    () => new URLSearchParams(window.location.search).get('scene') === '1',
  )
  const [muted, setMutedState] = useState(isMuted)
  const [dpr, setDpr] = useState(() => Math.min(1.5, window.devicePixelRatio))
  const now = game.clock

  const toggleMute = () => {
    setMuted(!muted)
    setMutedState(!muted)
  }

  return (
    <Box
      component="main"
      aria-label={t('game.label')}
      onContextMenu={blockContextMenu}
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: SKY,
        fontFamily: '"Nunito", "Arial Rounded MT Bold", system-ui, sans-serif',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <TopBar game={game} high={high} />
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Canvas
          shadows="percentage"
          dpr={dpr}
          gl={{
            alpha: false,
            // On dense screens the extra pixels already hide jaggies; MSAA would only cost fill rate.
            antialias: window.devicePixelRatio < 2,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          camera={{
            position: CAMERA_POSITION,
            fov: BASE_FOV,
            near: 0.08,
            far: 40,
          }}
          style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
        >
          <PerformanceMonitor
            onDecline={() => {
              setDpr(1)
            }}
          />
          <GameFxContext.Provider value={game.gameFx}>
            <TontieScene3D
              state={game.state}
              now={now}
              onHit={game.hit}
              high={high}
              photo={photo}
              attract={photo || !game.started}
            />
          </GameFxContext.Provider>
        </Canvas>
        <DamageFlash gameFx={game.gameFx} now={now} />
        <Banner gameFx={game.gameFx} now={now} />
      </Box>
      {!photo && (
        <BottomBar game={game} muted={muted} onToggleMute={toggleMute} />
      )}
      <HoleButtons game={game} />
      {!photo && <Overlays game={game} now={now} />}
    </Box>
  )
}
