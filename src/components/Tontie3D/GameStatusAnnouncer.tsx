import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { FPS } from '@game/spec'
import { BANNER_MS, type GameFx } from '@game3d/fx'
import type { GameState } from '@game/types'
import { srOnly } from './theme'

/** WCAG 4.1.3 / RGAA 11.10 — polite status updates for HUD values. */
export function GameStatusAnnouncer({
  state,
  high,
  gameFx,
  now,
}: {
  state: GameState
  high: number
  gameFx: GameFx
  now: number
}) {
  const { t } = useTranslation()
  const seconds = Math.max(0, Math.ceil(state.roundFramesLeft / FPS))
  const message = [
    t('game.time', { s: seconds }),
    t('game.score', { n: state.score }),
    t('game.highScore', { n: high }),
    t('game.level', { n: state.level }),
    t('game.life', { hp: Math.max(0, state.hp), max: state.hpMax }),
    t('game.money', { n: state.money }),
  ].join('. ')

  const banner = gameFx.banner
  let urgent: string | null = null
  if (banner && now - banner.at < BANNER_MS) {
    urgent = banner.kind === 'boss' ? t('game.boss') : t('game.hurry')
  }

  return (
    <>
      <Box role="status" aria-live="polite" aria-atomic="true" sx={srOnly}>
        {message}
      </Box>
      {urgent ? (
        <Box role="alert" aria-live="assertive" sx={srOnly}>
          {urgent}
        </Box>
      ) : null}
    </>
  )
}
