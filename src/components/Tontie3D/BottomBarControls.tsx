import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import type { GameState } from '@game/types'
import type { TontieGame } from '@/hooks/useTontieGame'
import { CoinIcon } from './ShopIcon'
import { themeColors } from './theme'
import { GameButton } from './ui'

export function BottomBarWallet({ state }: { state: GameState }) {
  const { t } = useTranslation()
  return (
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
  )
}

type BottomBarControlsProps = {
  game: TontieGame
  muted: boolean
  onToggleMute: () => void
  pauseLabel: string
  soundOnLabel: string
  soundOffLabel: string
}

export function BottomBarControls({
  game,
  muted,
  onToggleMute,
  pauseLabel,
  soundOnLabel,
  soundOffLabel,
}: BottomBarControlsProps) {
  return (
    <>
      <GameButton
        variant="icon"
        label={muted ? soundOnLabel : soundOffLabel}
        onClick={onToggleMute}
      >
        {muted ? '🔇' : '🔊'}
      </GameButton>
      {game.started && game.state.phase === 'playing' && (
        <GameButton variant="icon" label={pauseLabel} onClick={game.pause}>
          ⏸
        </GameButton>
      )}
    </>
  )
}
