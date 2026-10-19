import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { SHOP_OFFERS } from '@/game/shop'
import { GAME_HEIGHT, GAME_WIDTH } from '@/game/spec'
import { CAMERA_POSITION, CAMERA_TARGET } from '@/game3d/layout3d'
import { TontieScene3D } from '@/game3d/TontieScene3D'
import { useTontieGame } from '@/hooks/useTontieGame'
import type { GameState } from '@/game/types'

for (let i = 5; i <= 24; i++) {
  useGLTF.preload(`/game/models/mobs/${String(i)}.glb`)
}
useGLTF.preload('/game/models/mobs/default.glb')
useGLTF.preload('/game/models/mobs/treasure.glb')
useGLTF.preload('/game/models/mobs/shop.glb')
useGLTF.preload('/game/models/board.glb')
useGLTF.preload('/game/models/hammer.glb')

function HudOverlay({
  state,
  shopIndex,
}: {
  state: ReturnType<typeof useTontieGame>['state']
  shopIndex: number
}) {
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
        <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 1 }}>
          SHOP
        </Typography>
        {SHOP_OFFERS.map((o, i) => (
          <Typography
            key={o.label}
            sx={{
              opacity: i === shopIndex ? 1 : 0.75,
              fontWeight: i === shopIndex ? 700 : 400,
            }}
          >
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

function HudStatsOverlay({ state }: { state: GameState }) {
  if (
    state.phase === 'shop' ||
    state.phase === 'gameOver' ||
    state.phase === 'win' ||
    state.phase === 'paused'
  ) {
    return null
  }
  const heartSlots = 8
  const filled = Math.max(
    0,
    Math.min(
      heartSlots,
      Math.ceil((state.hp / Math.max(1, state.hpMax)) * heartSlots),
    ),
  )
  const roundSec = Math.ceil(state.roundFramesLeft / 17)

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fontWeight: 800,
        textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          background: 'linear-gradient(180deg, #4a9fd8 0%, #5a8fd4 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 6,
          left: 8,
          fontSize: 14,
          letterSpacing: 1,
        }}
      >
        {'♥'.repeat(filled)}
        <Box component="span" sx={{ opacity: 0.35 }}>
          {'♥'.repeat(heartSlots - filled)}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 22,
        }}
      >
        {roundSec}
      </Box>
      <Box sx={{ position: 'absolute', top: 8, right: 8, fontSize: 11 }}>
        $ {String(state.money).padStart(3, '0')}
      </Box>
      {state.gun > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 30,
            right: 8,
            fontSize: 10,
            color: '#e0f7fa',
          }}
        >
          RAY GUN {state.gunAmmo}
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 28,
          bgcolor: 'rgba(255,255,255,0.92)',
          color: '#2d2d2d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          fontSize: 10,
          fontWeight: 700,
          textShadow: 'none',
        }}
      >
        <span>LEVEL {state.level}</span>
        <span>SCORE {state.score}</span>
      </Box>
    </Box>
  )
}

export function Tontie3D() {
  const { state, shopIndex } = useTontieGame()

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mb: 1 }}
      >
        Port 3D — modèles Blender (sprites → volume), logique ffdec
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
          bgcolor: '#5a8fd4',
          '&:focus': {
            outline: '3px solid #6c5ce7',
            outlineOffset: 4,
          },
        }}
      >
        <Canvas
          shadows
          flat
          dpr={[1, 2]}
          gl={{ alpha: false, antialias: true }}
          camera={{ position: CAMERA_POSITION, fov: 43, near: 0.08, far: 40 }}
          onCreated={({ camera }) => {
            camera.lookAt(...CAMERA_TARGET)
          }}
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT, display: 'block' }}
        >
          <TontieScene3D state={state} />
        </Canvas>
        <HudStatsOverlay state={state} />
        <HudOverlay state={state} shopIndex={shopIndex} />
      </Box>
    </Box>
  )
}
