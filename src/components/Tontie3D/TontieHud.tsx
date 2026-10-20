import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import type { GameState } from '@/game/types'
import { BANNER_MS, DAMAGE_MS, type GameFx } from '@game3d/fx'
import { FPS } from '@/game/spec'
import type { TontieGame } from '@/hooks/useTontieGame'
import { CoinIcon } from './ShopIcon'
import { INK, RED, themeColors, WHITE, YELLOW, srOnly } from './theme'
import { GameButton } from './ui'

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
        color: themeColors.hudHeart,
        whiteSpace: 'nowrap',
      }}
    >
      {'♥'.repeat(filled)}
      <Box component="span" sx={{ color: themeColors.hudMutedWhite }}>
        {'♥'.repeat(HEART_SLOTS - filled)}
      </Box>
    </Box>
  )
}

/** Accessible mirror of the live displays mounted on the 3D cabinet. */
export function TopBar({ game, high }: { game: TontieGame; high: number }) {
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

/** Violet cabinet strip: lives, coins, level and the sound / pause buttons. */
export function BottomBar({
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
        color: WHITE,
        background: themeColors.hudBarBg,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${themeColors.hudBarBorder}`,
        boxShadow: `0 8px 32px ${themeColors.hudBarShadow}`,
        fontWeight: 900,
        textShadow: `0 2px 0 ${themeColors.hudTextShadow}`,
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
              sx={{ ml: 1, color: themeColors.hudAccentCyan }}
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

export function Banner({ gameFx, now }: { gameFx: GameFx; now: number }) {
  const { t } = useTranslation()
  const banner = gameFx.banner
  if (!banner || now - banner.at > BANNER_MS) return null
  const text = banner.kind === 'boss' ? t('game.boss') : t('game.hurry')
  return (
    <Box
      key={banner.at}
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
        color: banner.kind === 'boss' ? RED : YELLOW,
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

export function DamageFlash({ gameFx, now }: { gameFx: GameFx; now: number }) {
  if (now - gameFx.damageAt > DAMAGE_MS) return null
  return (
    <Box
      key={gameFx.damageAt}
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: `inset 0 0 70px 22px ${themeColors.damageFlash}`,
        animation: `tontie-fade-out ${String(DAMAGE_MS)}ms ease-out forwards`,
      }}
    />
  )
}
