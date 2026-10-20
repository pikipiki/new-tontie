import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import type { GameState } from '@/game/types'
import type { GameFx } from '@game3d/fx'
import {
  INK,
  ORANGE,
  PURPLE,
  PURPLE_DEEP,
  panelCard,
  themeColors,
  YELLOW,
} from './theme'
import { Overlay } from './ui'
import { CartoonTitle } from './CartoonTitle'
import { LevelTab } from './levelPanelShared'

function RateRow({
  label,
  value,
  shown,
  delay,
}: {
  label: string
  value: number
  shown: number
  delay: number
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 900,
          fontSize: 15,
        }}
      >
        <span>{label}</span>
        <Box
          component="span"
          sx={{ color: PURPLE, fontVariantNumeric: 'tabular-nums' }}
        >
          {shown.toFixed(1)} %
        </Box>
      </Box>
      <Box
        aria-hidden
        sx={{
          height: 12,
          borderRadius: 999,
          border: `2px solid ${INK}`,
          bgcolor: themeColors.purplePanel,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${String(value)}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${YELLOW}, ${ORANGE})`,
            transformOrigin: 'left',
            animation: `tontie-bar 700ms ${String(delay)}ms cubic-bezier(.3,1.2,.5,1) both`,
          }}
        />
      </Box>
    </Box>
  )
}

const COUNT_MS = 900

function countUp(target: number, elapsed: number, delay: number): number {
  const blend = Math.min(1, Math.max(0, (elapsed - delay) / COUNT_MS))
  return target * (1 - (1 - blend) ** 3)
}

/** up_boad "up" → frame 67: LEVEL CLEAR!! and the level's hit / beat rates. */
export function LevelClearPanel({
  state,
  gameFx,
  now,
}: {
  state: GameState
  gameFx: GameFx
  now: number
}) {
  const { t } = useTranslation()
  const summary = state.lastClear
  if (!summary) return null
  const elapsed = now - gameFx.clearAt
  return (
    <Overlay
      label={t('game.levelClearLabel', { n: summary.level })}
      tone="clear"
    >
      <CartoonTitle text={t('game.levelClear')} />
      <Box
        aria-live="polite"
        sx={{
          ...panelCard,
          width: 'min(86vw, 340px)',
          mt: 6,
          p: 2,
          pt: 2.25,
          display: 'grid',
          gap: 1.5,
          textAlign: 'left',
          animation:
            'tontie-panel-in 560ms 380ms cubic-bezier(.2,1.5,.4,1) both',
        }}
      >
        <LevelTab level={summary.level} small />
        <RateRow
          label={t('game.hitRate')}
          value={summary.hitRate}
          shown={countUp(summary.hitRate, elapsed, 500)}
          delay={500}
        />
        <RateRow
          label={t('game.beatRate')}
          value={summary.beatRate}
          shown={countUp(summary.beatRate, elapsed, 700)}
          delay={700}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontWeight: 900,
            borderTop: `2px dashed ${PURPLE_DEEP}`,
            pt: 1,
          }}
        >
          <span>{t('game.scoreGained')}</span>
          <Box
            component="span"
            sx={{
              fontSize: 26,
              color: themeColors.statBlue,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            +{Math.round(countUp(summary.scoreGained, elapsed, 900))}
          </Box>
        </Box>
      </Box>
    </Overlay>
  )
}
