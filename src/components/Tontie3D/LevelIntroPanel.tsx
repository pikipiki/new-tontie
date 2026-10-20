import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { enemyFromCatalogFrame } from '@/game/combat'
import { introCatalogFrame } from '@/game/engine'
import type { GameState } from '@/game/types'
import { INK, panelCard, RED, WHITE, YELLOW } from './theme'
import { Overlay } from './ui'
import { LevelTab, PANEL_WIDTH } from './levelPanelShared'
import { traitsFor } from './levelPanelTraits'
import {
  IntroEnemyStats,
  IntroMonsterStage,
  IntroStartRow,
} from './levelIntroSections'

/** up_boad "on": LEVEL NN, the monster this level adds (DefineSprite_458 frame lv + 4), its data, START. */
export function LevelIntroPanel({
  state,
  onStart,
  leaving,
}: {
  state: GameState
  onStart: () => void
  leaving: boolean
}) {
  const { t } = useTranslation()
  const frame = introCatalogFrame(state.level)
  const enemy = enemyFromCatalogFrame(frame)
  const boss = enemy.kind === 'boss'
  const traits = traitsFor(frame)

  return (
    <Overlay label={t('game.level', { n: state.level })} leaving={leaving}>
      <Box
        sx={{
          ...panelCard,
          width: PANEL_WIDTH,
          mt: 5,
          p: 2,
          pt: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          animation: leaving
            ? 'tontie-panel-out 520ms cubic-bezier(.5,-0.4,.8,.4) forwards'
            : 'tontie-panel-in 560ms cubic-bezier(.2,1.5,.4,1) both',
        }}
      >
        <LevelTab level={state.level} />
        <Box
          sx={{
            alignSelf: 'flex-start',
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: boss ? RED : YELLOW,
            color: boss ? WHITE : INK,
            border: `3px solid ${INK}`,
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 0.5,
            transform: 'rotate(-3deg)',
            animation: 'tontie-pop 420ms 240ms cubic-bezier(.2,1.8,.4,1) both',
          }}
        >
          {boss ? t('game.bossIncoming') : t('game.newMonster')}
        </Box>

        <IntroMonsterStage frame={frame} boss={boss} traits={traits} t={t} />
        <IntroEnemyStats enemy={enemy} t={t} />
        <IntroStartRow level={state.level} onStart={onStart} t={t} />
      </Box>
    </Overlay>
  )
}
