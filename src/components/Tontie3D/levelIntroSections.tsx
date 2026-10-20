import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import type { TFunction } from 'i18next'
import type { EnemySpawn } from '@game/types'
import { catalogFrameGlbKey } from '@game3d/resolveMobGlb'
import { MonsterPreview } from './MonsterPreview'
import {
  cartoonText,
  GREEN_DEEP,
  INK,
  INTRO_BOSS_STAGE_BG,
  INTRO_MONSTER_STAGE_BG,
  INTRO_STAGE_SPIN,
  INTRO_START_GRADIENT,
  PURPLE_DEEP,
  RED,
  themeColors,
  WHITE,
} from './theme'
import { StatCell } from './levelPanelShared'

export function IntroMonsterStage({
  frame,
  boss,
  traits,
  t,
}: {
  frame: number
  boss: boolean
  traits: string[]
  t: TFunction
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 190, sm: 220 },
        borderRadius: '16px',
        overflow: 'hidden',
        border: `3px solid ${INK}`,
        background: boss ? INTRO_BOSS_STAGE_BG : INTRO_MONSTER_STAGE_BG,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-50%',
          background: INTRO_STAGE_SPIN,
          animation: 'tontie-spin 16s linear infinite',
        },
      }}
    >
      <MonsterPreview glbKey={catalogFrameGlbKey(frame)} />
      {traits.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: 8,
            right: 8,
            bottom: 8,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          {traits.map((traitKey) => (
            <Box
              key={traitKey}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 999,
                bgcolor: themeColors.purpleOverlay,
                color: WHITE,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {t(`game.${traitKey}`)}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export function IntroEnemyStats({
  enemy,
  t,
}: {
  enemy: EnemySpawn
  t: TFunction
}) {
  return (
    <Box
      role="list"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        border: `3px solid ${INK}`,
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: themeColors.statGridBg,
        '& > * + *': { borderLeft: `2px dashed ${PURPLE_DEEP}` },
      }}
    >
      <StatCell
        head={t('game.statLife')}
        icon="♥"
        value={String(enemy.maxHp)}
        color={PURPLE_DEEP}
        label={t('game.statLifeLabel', { n: enemy.maxHp })}
      />
      <StatCell
        head={t('game.statPoint')}
        icon="★"
        value={String(enemy.score)}
        color={themeColors.statBlue}
        label={t('game.statPointLabel', { n: enemy.score })}
      />
      <StatCell
        head={t('game.statLost')}
        icon="♡"
        value={enemy.attack > 0 ? `-${String(enemy.attack)}` : '0'}
        color={enemy.attack > 0 ? RED : themeColors.greenSafe}
        label={t('game.statLostLabel', { n: enemy.attack })}
      />
    </Box>
  )
}

export function IntroStartRow({
  level,
  onStart,
  t,
}: {
  level: number
  onStart: () => void
  t: TFunction
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <ButtonBase
        autoFocus
        onClick={onStart}
        aria-label={t('game.startLabel', { n: level })}
        sx={{
          flex: 1,
          minHeight: 64,
          borderRadius: '16px',
          fontFamily: 'inherit',
          border: `4px solid ${INK}`,
          background: INTRO_START_GRADIENT,
          boxShadow: `0 6px 0 ${GREEN_DEEP}, 0 6px 0 3px ${INK}`,
          transition: 'transform 80ms ease, box-shadow 80ms ease',
          animation: 'tontie-pulse 1.6s ease-in-out 700ms infinite',
          '&:active': {
            transform: 'translateY(5px)',
            boxShadow: `0 1px 0 ${GREEN_DEEP}, 0 1px 0 3px ${INK}`,
          },
          '&.Mui-focusVisible': {
            outline: `3px solid ${themeColors.focusHighContrast}`,
            outlineOffset: 3,
          },
        }}
      >
        <Box
          component="span"
          sx={{ ...cartoonText(WHITE, INK, 5), fontSize: 30 }}
        >
          {t('game.start')}
        </Box>
      </ButtonBase>
      <Box
        aria-hidden
        sx={{
          display: { xs: 'none', sm: 'block' },
          maxWidth: 90,
          fontSize: 12,
          fontWeight: 800,
          color: themeColors.purpleMuted,
          textAlign: 'left',
        }}
      >
        {t('game.startHint')}
      </Box>
    </Box>
  )
}
