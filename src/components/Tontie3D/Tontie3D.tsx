import Box from '@mui/material/Box'
import { PerformanceMonitor, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { isMuted, setMuted } from '@/game/audio'
import { HOLE_ORDER } from '@/game/layout'
import { FPS } from '@/game/spec'
import type { GameState, HoleIndex } from '@/game/types'
import {
  BANNER_MS,
  DAMAGE_MS,
  GameFxContext,
  PANEL_OUT_MS,
  type GameFx,
} from '@/game3d/fx'
import { BASE_FOV, CAMERA_POSITION } from '@/game3d/layout3d'
import { TontieScene3D } from '@/game3d/TontieScene3D'
import { useTontieGame, type TontieGame } from '@/hooks/useTontieGame'
import { CartoonTitle, LevelClearPanel, LevelIntroPanel } from './LevelPanels'
import { CoinIcon } from './ShopIcon'
import { ShopPanel } from './ShopPanel'
import {
  CABINET_PINK,
  CABINET_PINK_DEEP,
  CABINET_VIOLET,
  INK,
  LED_RED,
  LED_SCREEN,
  panelCard,
  PURPLE,
  RED,
  SKY,
  srOnly,
  YELLOW,
} from './theme'
import { GameButton, Overlay } from './ui'

for (let i = 5; i <= 24; i++) {
  useGLTF.preload(`/game/models/mobs/${String(i)}.glb`)
}
for (const key of ['default', 'treasure', 'shop']) {
  useGLTF.preload(`/game/models/mobs/${key}.glb`)
}
useGLTF.preload('/game/models/board.glb')
useGLTF.preload('/game/models/hammer.glb')
useGLTF.preload('/game/models/player.glb')

const HEART_SLOTS = 8

function Hearts({ state }: { state: GameState }) {
  const { t } = useTranslation()
  const filled = Math.max(
    0,
    Math.min(
      HEART_SLOTS,
      Math.ceil((state.hp / Math.max(1, state.hpMax)) * HEART_SLOTS),
    ),
  )
  return (
    <Box
      role="img"
      aria-label={t('game.life', {
        hp: Math.max(0, state.hp),
        max: state.hpMax,
      })}
      sx={{
        fontSize: { xs: 18, sm: 22 },
        letterSpacing: 1,
        lineHeight: 1,
        color: '#ff3b6b',
        whiteSpace: 'nowrap',
      }}
    >
      {'♥'.repeat(filled)}
      <Box component="span" sx={{ color: 'rgba(255,255,255,0.35)' }}>
        {'♥'.repeat(HEART_SLOTS - filled)}
      </Box>
    </Box>
  )
}

const HIGH_SCORE_KEY = 'tontie.highScore'

function readHighScore(): number {
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0
  } catch {
    return 0
  }
}

function useHighScore(score: number): number {
  useEffect(() => {
    if (score <= readHighScore()) return
    try {
      localStorage.setItem(HIGH_SCORE_KEY, String(score))
    } catch {
      // private mode: no stored record, the current score is shown instead
    }
  }, [score])
  return Math.max(readHighScore(), score)
}

/** Black LED screen with red seven-segment-style digits over their unlit "8" ghosts. */
function LedScreen({
  label,
  value,
  digits,
  ariaLabel,
  role = 'img',
  blink = false,
}: {
  label: string
  value: number
  digits: number
  ariaLabel: string
  role?: 'img' | 'timer'
  blink?: boolean
}) {
  const text = String(Math.min(value, 10 ** digits - 1)).padStart(digits, ' ')
  const led = {
    fontFamily: '"Courier New", ui-monospace, monospace',
    fontWeight: 700,
    fontSize: { xs: 22, sm: 30 },
    letterSpacing: '0.08em',
    lineHeight: 1,
    whiteSpace: 'pre',
  } as const
  return (
    <Box role={role} aria-label={ariaLabel} sx={{ minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          fontSize: { xs: 10, sm: 12 },
          fontWeight: 900,
          letterSpacing: 1,
          color: LED_RED,
          textAlign: 'center',
          mb: 0.25,
        }}
      >
        {label}
      </Box>
      <Box
        aria-hidden
        sx={{
          position: 'relative',
          px: 0.75,
          py: 0.5,
          bgcolor: LED_SCREEN,
          border: `2px solid ${CABINET_PINK_DEEP}`,
          borderRadius: '8px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9)',
          textAlign: 'right',
        }}
      >
        <Box sx={{ ...led, color: 'rgba(255,58,46,0.1)' }}>
          {'8'.repeat(digits)}
        </Box>
        <Box
          sx={{
            ...led,
            position: 'absolute',
            inset: 0,
            px: 0.75,
            py: 0.5,
            color: LED_RED,
            textShadow: '0 0 6px rgba(255,58,46,0.85)',
            animation: blink ? 'tontie-blink 0.5s steps(1) infinite' : 'none',
          }}
        >
          {text}
        </Box>
      </Box>
    </Box>
  )
}

/** Pink velour marquee of the plush cabinet: time, score and high score screens. */
function TopBar({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  const { state } = game
  const seconds = Math.max(0, Math.ceil(state.roundFramesLeft / FPS))
  const high = useHighScore(state.score)
  return (
    <Box
      component="header"
      sx={{ px: 1, pt: 'max(8px, env(safe-area-inset-top))', pb: 0.75 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr',
          gap: { xs: 0.75, sm: 1.5 },
          p: { xs: 0.75, sm: 1 },
          borderRadius: '18px',
          background: `linear-gradient(180deg, ${CABINET_PINK} 0%, ${CABINET_PINK_DEEP} 100%)`,
          border: `3px solid ${CABINET_VIOLET}`,
          boxShadow:
            'inset 0 2px 0 rgba(255,255,255,0.45), 0 4px 0 #3a1a70, 0 10px 24px rgba(0,0,0,0.45)',
        }}
      >
        <LedScreen
          label={t('game.hudTime')}
          value={seconds}
          digits={2}
          role="timer"
          ariaLabel={t('game.time', { s: seconds })}
          blink={state.phase === 'playing' && seconds <= 5}
        />
        <LedScreen
          label={t('game.hudScore')}
          value={state.score}
          digits={6}
          ariaLabel={t('game.score', { n: state.score })}
        />
        <LedScreen
          label={t('game.hudHigh')}
          value={high}
          digits={6}
          ariaLabel={t('game.highScore', { n: high })}
        />
      </Box>
    </Box>
  )
}

/** Violet cabinet strip: lives, coins, level and the sound / pause buttons. */
function BottomBar({
  game,
  muted,
  onToggleMute,
}: {
  game: TontieGame
  muted: boolean
  onToggleMute: () => void
}) {
  const { t } = useTranslation()
  const { state } = game
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        pt: 0.75,
        pb: 'max(8px, env(safe-area-inset-bottom))',
        color: '#fff',
        background: `linear-gradient(180deg, ${CABINET_VIOLET} 0%, #43208a 100%)`,
        borderTop: `3px solid ${CABINET_PINK_DEEP}`,
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.25)',
        fontWeight: 900,
        textShadow: '0 2px 0 rgba(0,0,0,0.3)',
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
        <Hearts state={state} />
        <Box
          aria-label={t('game.money', { n: state.money })}
          role="img"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 15 }}
        >
          <CoinIcon size={16} />
          {state.money}
          {state.gun > 0 && (
            <Box
              component="span"
              aria-label={t('game.gun', { n: state.gunAmmo })}
              sx={{ ml: 1, color: '#bff4ff' }}
            >
              ⚡{state.gunAmmo}
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{ flex: 1, textAlign: 'center', fontSize: 15, letterSpacing: 1 }}
      >
        {t('game.level', { n: state.level })}
      </Box>
      <GameButton
        variant="icon"
        label={muted ? t('game.soundOn') : t('game.soundOff')}
        onClick={onToggleMute}
      >
        {muted ? '🔇' : '🔊'}
      </GameButton>
      {game.started && state.phase === 'playing' && (
        <GameButton variant="icon" label={t('game.pause')} onClick={game.pause}>
          ⏸
        </GameButton>
      )}
    </Box>
  )
}

function Banner({ fx, now }: { fx: GameFx; now: number }) {
  const { t } = useTranslation()
  const b = fx.banner
  if (!b || now - b.at > BANNER_MS) return null
  const text = b.kind === 'boss' ? t('game.boss') : t('game.hurry')
  return (
    <Box
      key={b.at}
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '38%',
        textAlign: 'center',
        pointerEvents: 'none',
        fontWeight: 900,
        fontSize: { xs: 44, sm: 56 },
        color: b.kind === 'boss' ? RED : YELLOW,
        WebkitTextStroke: `6px ${INK}`,
        paintOrder: 'stroke fill',
        textShadow: `0 5px 0 ${INK}`,
        animation: `tontie-banner ${String(BANNER_MS)}ms ease-out forwards`,
      }}
    >
      {text}
    </Box>
  )
}

function DamageFlash({ fx, now }: { fx: GameFx; now: number }) {
  if (now - fx.damageAt > DAMAGE_MS) return null
  return (
    <Box
      key={fx.damageAt}
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 70px 22px rgba(255, 30, 60, 0.75)',
        animation: `tontie-fade-out ${String(DAMAGE_MS)}ms ease-out forwards`,
      }}
    />
  )
}

function holeLabel(state: GameState, hole: HoleIndex, t: TFunction): string {
  const slot = state.holes[hole]
  if (slot.phase === 'off' || slot.enemy.kind === 'none')
    return t('game.holeEmpty', { n: hole })
  if (slot.enemy.kind === 'shop') return t('game.holeShop', { n: hole })
  if (slot.enemy.kind === 'treasure') return t('game.holeTreasure', { n: hole })
  if (slot.enemy.kind === 'boss') return t('game.holeBoss', { n: hole })
  return t('game.holeEnemy', { n: hole })
}

/** Screen-reader / switch-access grid mirroring the 3×3 board (numpad layout). */
function HoleButtons({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  if (!game.started || game.state.phase !== 'playing') return null
  return (
    <Box role="group" aria-label={t('game.holes')} sx={srOnly}>
      {HOLE_ORDER.map((hole) => (
        <button
          key={hole}
          type="button"
          onClick={() => {
            game.hit(hole)
          }}
        >
          {holeLabel(game.state, hole, t)}
        </button>
      ))}
    </Box>
  )
}

function EndPanel({
  title,
  fill,
  game,
}: {
  title: string
  fill: string
  game: TontieGame
}) {
  const { t } = useTranslation()
  return (
    <Overlay label={title}>
      <CartoonTitle text={title} fill={fill} size={44} />
      <Box
        sx={{
          ...panelCard,
          width: 'min(86vw, 320px)',
          p: 2.5,
          display: 'grid',
          gap: 2,
          animation:
            'tontie-panel-in 560ms 300ms cubic-bezier(.2,1.5,.4,1) both',
        }}
      >
        <Box sx={{ fontSize: 22, fontWeight: 900, color: PURPLE }}>
          {t('game.finalScore', { n: game.state.score })}
        </Box>
        <GameButton autoFocus onClick={game.restart}>
          ↻ {t('game.restart')}
        </GameButton>
      </Box>
    </Overlay>
  )
}

function Overlays({ game, now }: { game: TontieGame; now: number }) {
  const { t } = useTranslation()
  const { state, fx } = game
  switch (state.phase) {
    case 'levelIntro':
      return (
        <LevelIntroPanel state={state} onStart={game.start} leaving={false} />
      )
    case 'playing':
      return now - fx.startAt < PANEL_OUT_MS ? (
        <LevelIntroPanel state={state} onStart={game.start} leaving />
      ) : null
    case 'levelClear':
      return <LevelClearPanel state={state} fx={fx} now={now} />
    case 'shop':
      return <ShopPanel game={game} />
    case 'paused':
      return (
        <Overlay label={t('game.paused')}>
          <CartoonTitle text={t('game.paused')} fill="#fff" size={52} />
          <GameButton autoFocus onClick={game.pause}>
            ▶ {t('game.resume')}
          </GameButton>
        </Overlay>
      )
    case 'win':
      return <EndPanel title={t('game.congrats')} fill="#ff5fa2" game={game} />
    case 'gameOver':
      return <EndPanel title={t('game.gameOver')} fill="#9aa3b5" game={game} />
  }
}

export function Tontie3D() {
  const { t } = useTranslation()
  const game = useTontieGame()
  const [muted, setMutedState] = useState(isMuted)
  /** Capped pixel density, dropped to 1 as soon as the frame rate sags. */
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
      onContextMenu={(e) => {
        e.preventDefault()
      }}
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
      <TopBar game={game} />
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Canvas
          flat
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
          <GameFxContext.Provider value={game.fx}>
            <TontieScene3D state={game.state} now={now} onHit={game.hit} />
          </GameFxContext.Provider>
        </Canvas>
        <DamageFlash fx={game.fx} now={now} />
        <Banner fx={game.fx} now={now} />
      </Box>
      <BottomBar game={game} muted={muted} onToggleMute={toggleMute} />
      <HoleButtons game={game} />
      <Overlays game={game} now={now} />
    </Box>
  )
}
