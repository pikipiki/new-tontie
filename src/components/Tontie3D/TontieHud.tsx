import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { BANNER_MS, DAMAGE_MS, type GameFx } from '@game3d/fx'
import { FPS } from '@game/spec'
import type { TontieGame } from '@/hooks/useTontieGame'
import { INK, RED, themeColors, WHITE, YELLOW, srOnly } from './theme'
import { Hearts } from './Hearts'
import { LaserAmmoDisplay } from './LaserAmmoDisplay'
import { BottomBarControls, BottomBarWallet } from './BottomBarControls'

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
  const showAmmo =
    state.gun > 0 ||
    (game.gameFx.laser !== null && game.clock - game.gameFx.laser.at < 1500)
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        flexShrink: 0,
        mx: 'auto',
        mb: 'max(12px, env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
        width: 'min(calc(100% - 32px), 680px)',
        zIndex: 3,
        borderRadius: '24px',
        display: 'grid',
        gap: 0.5,
        '@media (max-height: 500px) and (orientation: landscape)': {
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: 1.5,
          alignItems: 'center',
        },
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
      <Hearts state={state} />
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}
      >
        <Box sx={{ display: 'grid', gap: 0.25, minWidth: 46 }}>
          <BottomBarWallet state={state} />
          <Box
            component="span"
            aria-label={t('game.level', { n: state.level })}
            sx={{ fontSize: 11, whiteSpace: 'nowrap' }}
          >
            {t('game.level', { n: state.level })}
          </Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, px: 0.5 }}>
          {showAmmo && <LaserAmmoDisplay ammo={state.gunAmmo} />}
        </Box>
        <BottomBarControls
          game={game}
          muted={muted}
          onToggleMute={onToggleMute}
          pauseLabel={t('game.pause')}
          soundOnLabel={t('game.soundOn')}
          soundOffLabel={t('game.soundOff')}
        />
      </Box>
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
