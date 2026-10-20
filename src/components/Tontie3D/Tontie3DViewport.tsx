import Box from '@mui/material/Box'
import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { GameFxContext } from '@game3d/fx'
import { BASE_FOV, CAMERA_POSITION } from '@game3d/layout3d'
import { TontieScene3D } from '@game3d/TontieScene3D'
import type { TontieGame } from '@/hooks/useTontieGame'
import { Banner, DamageFlash } from './TontieHud'

type Tontie3DViewportProps = {
  game: TontieGame
  high: number
  now: number
  photo: boolean
  dpr: number
  onDeclineDpr: () => void
}

export function Tontie3DViewport({
  game,
  high,
  now,
  photo,
  dpr,
  onDeclineDpr,
}: Tontie3DViewportProps) {
  return (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
      <Canvas
        shadows="percentage"
        dpr={dpr}
        gl={{
          alpha: false,
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
        <PerformanceMonitor onDecline={onDeclineDpr} />
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
  )
}
