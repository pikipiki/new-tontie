import Box from '@mui/material/Box'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { HOLE_ORDER } from '@game/layout'
import type { GameState, HoleIndex } from '@game/types'
import type { TontieGame } from '@/hooks/useTontieGame'
import { CartoonTitle, LevelClearPanel, LevelIntroPanel } from './LevelPanels'
import { ShopPanel } from './ShopPanel'
import { PURPLE, panelCard, srOnlyFocusable, themeColors, WHITE } from './theme'
import { GameButton, Overlay } from './ui'

export function WelcomePanel({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 'max(154px, calc(env(safe-area-inset-bottom) + 142px))',
        '@media (max-height: 500px) and (orientation: landscape)': {
          bottom: 98,
        },
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
        color: themeColors.overlayCream,
        background: themeColors.overlayBg,
        backdropFilter: 'blur(18px)',
        border: `1px solid ${themeColors.overlayBorder}`,
        boxShadow: `0 12px 44px ${themeColors.overlayShadow}`,
      }}
    >
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Box sx={{ fontWeight: 900, fontSize: 19 }}>{t('game.welcome')}</Box>
        <Box
          sx={{
            fontSize: 13,
            mt: 0.4,
            color: themeColors.cream,
            fontWeight: 700,
          }}
        >
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

function holeLabel(
  state: GameState,
  hole: HoleIndex,
  translate: TFunction,
): string {
  const slot = state.holes[hole]
  if (slot.phase === 'off' || slot.enemy.kind === 'none')
    return translate('game.holeEmpty', { n: hole })
  if (slot.enemy.kind === 'shop') return translate('game.holeShop', { n: hole })
  if (slot.enemy.kind === 'treasure')
    return translate('game.holeTreasure', { n: hole })
  if (slot.enemy.kind === 'boss') return translate('game.holeBoss', { n: hole })
  return translate('game.holeEnemy', { n: hole })
}

/** Screen-reader / switch-access grid mirroring the 3×3 board (numpad layout). */
export function HoleButtons({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  if (!game.started || game.state.phase !== 'playing') return null
  return (
    <Box role="group" aria-label={t('game.holes')} sx={srOnlyFocusable}>
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

export function EndPanel({
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
        {game.state.phase === 'gameOver' && game.state.continues > 0 && (
          <GameButton onClick={game.continueGame}>
            {t('game.continue', { n: game.state.continues })}
          </GameButton>
        )}
        <GameButton autoFocus onClick={game.restart} label={t('game.restart')}>
          ↻ {t('game.restart')}
        </GameButton>
      </Box>
    </Overlay>
  )
}

export function Overlays({ game, now }: { game: TontieGame; now: number }) {
  const { t } = useTranslation()
  const { state, gameFx } = game
  if (!game.started) return <WelcomePanel game={game} />
  switch (state.phase) {
    case 'levelIntro':
      return (
        <LevelIntroPanel state={state} onStart={game.start} leaving={false} />
      )
    case 'playing':
      return null
    case 'levelClear':
      return <LevelClearPanel state={state} gameFx={gameFx} now={now} />
    case 'shop':
      return <ShopPanel game={game} />
    case 'paused':
      return (
        <Overlay label={t('game.paused')}>
          <CartoonTitle text={t('game.paused')} fill={WHITE} size={52} />
          <GameButton autoFocus onClick={game.pause}>
            ▶ {t('game.resume')}
          </GameButton>
        </Overlay>
      )
    case 'win':
      return (
        <EndPanel
          title={t('game.congrats')}
          fill={themeColors.endCongrats}
          game={game}
        />
      )
    case 'gameOver':
      return (
        <EndPanel
          title={t('game.gameOver')}
          fill={themeColors.endGameOver}
          game={game}
        />
      )
  }
}
