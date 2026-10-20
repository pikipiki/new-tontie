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
import { BANNER_MS, DAMAGE_MS, GameFxContext, type GameFx } from '@/game3d/fx'
import { BASE_FOV, CAMERA_POSITION } from '@/game3d/layout3d'
import { TontieScene3D } from '@/game3d/TontieScene3D'
import { useTontieGame, type TontieGame } from '@/hooks/useTontieGame'
import { CartoonTitle, LevelClearPanel, LevelIntroPanel } from './LevelPanels'
import { CoinIcon } from './ShopIcon'
import { ShopPanel } from './ShopPanel'
import { INK, panelCard, PURPLE, RED, SKY, srOnly, YELLOW } from './theme'
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
        fontSize: { xs: 16, sm: 22 },
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

/** Accessible mirror of the live displays mounted on the 3D cabinet. */
function TopBar({ game, high }: { game: TontieGame; high: number }) {
  const { t } = useTranslation()
  const seconds = Math.max(0, Math.ceil(game.state.roundFramesLeft / FPS))
  return (
    <Box component="header" sx={srOnly}>
      <span role="timer" aria-label={t('game.time', { s: seconds })}>
        {seconds}
      </span>
      <span aria-label={t('game.score', { n: game.state.score })}>
        {game.state.score}
      </span>
      <span aria-label={t('game.highScore', { n: high })}>{high}</span>
    </Box>
  )
}

function WelcomePanel({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 'max(106px, calc(env(safe-area-inset-bottom) + 94px))',
        left: { xs: '50%', sm: 'auto' },
        right: { xs: 'auto', sm: 24 },
        transform: { xs: 'translateX(-50%)', sm: 'none' },
        zIndex: 3,
        width: { xs: 'min(calc(100% - 32px), 490px)', sm: 'min(44vw, 490px)' },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: '14px 18px',
        borderRadius: '22px',
        color: '#fff0e7',
        background: 'rgba(38, 21, 40, 0.88)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255, 196, 215, .26)',
        boxShadow: '0 12px 44px #100b1880',
      }}
    >
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Box sx={{ fontWeight: 900, fontSize: 19 }}>{t('game.welcome')}</Box>
        <Box sx={{ fontSize: 12, mt: 0.4, opacity: 0.7 }}>
          {t('game.welcomeHint')}
        </Box>
      </Box>
      <GameButton
        onClick={game.start}
        label={t('game.startLabel', { n: game.state.level })}
      >
        ▶ {t('game.play')}
      </GameButton>
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
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        width: 'min(calc(100% - 32px), 680px)',
        zIndex: 3,
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        pt: 0.75,
        pb: 0.75,
        color: '#fff',
        background: 'rgba(28, 17, 36, .82)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(238,182,214,.2)',
        boxShadow: '0 8px 32px #0d081b66',
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
  if (!game.started) return <WelcomePanel game={game} />
  switch (state.phase) {
    case 'levelIntro':
      return (
        <LevelIntroPanel state={state} onStart={game.start} leaving={false} />
      )
    case 'playing':
      return null
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
  const high = useHighScore(game.state.score)
  const [photo] = useState(
    () => new URLSearchParams(window.location.search).get('scene') === '1',
  )
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
          <GameFxContext.Provider value={game.fx}>
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
        <DamageFlash fx={game.fx} now={now} />
        <Banner fx={game.fx} now={now} />
      </Box>
      {!photo && (
        <BottomBar game={game} muted={muted} onToggleMute={toggleMute} />
      )}
      <HoleButtons game={game} />
      {!photo && <Overlays game={game} now={now} />}
    </Box>
  )
}
