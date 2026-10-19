import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { SHOP_OFFERS } from '@/game/shop'
import { GAME_HEIGHT, GAME_WIDTH } from '@/game/spec'
import { TontieScene3D } from '@/game3d/TontieScene3D'
import { useTontieGame } from '@/hooks/useTontieGame'

for (let i = 5; i <= 24; i++) {
  useGLTF.preload(`/game/models/mobs/${i}.glb`)
}
useGLTF.preload('/game/models/mobs/default.glb')
useGLTF.preload('/game/models/mobs/treasure.glb')

function HudOverlay({ state, shopIndex }: { state: ReturnType<typeof useTontieGame>['state']; shopIndex: number }) {
  if (state.phase === 'paused') {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.35)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 20,
          pointerEvents: 'none',
        }}
      >
        PAUSE
      </Box>
    )
  }
  if (state.phase === 'shop') {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.55)',
          color: '#fff',
          p: 2,
          pointerEvents: 'none',
          fontSize: 12,
        }}
      >
        <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 1 }}>SHOP</Typography>
        {SHOP_OFFERS.map((o, i) => (
          <Typography key={o.label} sx={{ opacity: i === shopIndex ? 1 : 0.75, fontWeight: i === shopIndex ? 700 : 400 }}>
            {i + 1}. {o.label} — ${o.price}
          </Typography>
        ))}
      </Box>
    )
  }
  if (state.phase === 'gameOver' || state.phase === 'win') {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.65)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 22,
          pointerEvents: 'none',
        }}
      >
        {state.phase === 'win' ? 'YOU WIN!' : 'GAME OVER'}
      </Box>
    )
  }
  return null
}

export function Tontie3D() {
  const { state, shopIndex } = useTontieGame()

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
        Port 3D (Three.js) — même logique ffdec, branche feature/3d-remake
      </Typography>
      <Box
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.focus()
        }}
        sx={{
          position: 'relative',
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          mx: 'auto',
          border: '2px solid rgba(0,0,0,0.15)',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.12)',
          outline: 'none',
          bgcolor: '#6eb5e8',
          '&:focus': {
            outline: '3px solid #6c5ce7',
            outlineOffset: 4,
          },
        }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ alpha: false, antialias: true }}
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          <Suspense fallback={null}>
            <TontieScene3D state={state} />
          </Suspense>
        </Canvas>
        <HudOverlay state={state} shopIndex={shopIndex} />
      </Box>
    </Box>
  )
}
