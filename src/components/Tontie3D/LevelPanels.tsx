import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { useTranslation } from 'react-i18next'
import { enemyFromCatalogFrame } from '@/game/combat'
import { BOMB_FRAMES, introCatalogFrame } from '@/game/engine'
import type { GameState } from '@/game/types'
import type { GameFx } from '@/game3d/fx'
import { catalogFrameGlbKey } from '@/game3d/resolveMobGlb'
import { MonsterPreview } from './MonsterPreview'
import {
  cartoonText,
  GREEN,
  GREEN_DEEP,
  INK,
  ORANGE,
  PAPER,
  panelCard,
  PURPLE,
  PURPLE_DEEP,
  RED,
  YELLOW,
} from './theme'
import { Overlay } from './ui'

const PANEL_WIDTH = 'min(92vw, 400px)'

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Folder tab on the panel's top-right corner, as drawn on up_boad. */
function LevelTab({
  level,
  small = false,
}: {
  level: number
  small?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        right: 18,
        bottom: '100%',
        mb: '-4px',
        px: small ? 1.5 : 2,
        pt: 0.5,
        pb: '6px',
        display: 'flex',
        alignItems: 'baseline',
        gap: 0.75,
        bgcolor: PAPER,
        border: `4px solid ${INK}`,
        borderBottom: 'none',
        borderRadius: '16px 16px 0 0',
        color: PURPLE,
        fontWeight: 900,
        zIndex: 1,
      }}
    >
      <Box
        component="span"
        sx={{ fontSize: small ? 13 : 15, letterSpacing: 1 }}
      >
        {t('game.levelTab')}
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: small ? 26 : 34,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {pad2(level)}
      </Box>
    </Box>
  )
}

function traitsFor(frame: number): string[] {
  const enemy = enemyFromCatalogFrame(frame)
  const traits: string[] = []
  if (enemy.kind === 'boss') traits.push('traitBoss')
  if (BOMB_FRAMES.includes(frame)) traits.push('traitBomb')
  if (enemy.item === 'life') traits.push('traitHeal')
  if (enemy.item === 'coin' || enemy.coinSteal !== undefined)
    traits.push('traitCoins')
  if (enemy.nikai) traits.push('traitTwoHit')
  return traits
}

function StatCell({
  head,
  value,
  label,
  color,
  icon,
}: {
  head: string
  value: string
  label: string
  color: string
  icon: string
}) {
  return (
    <Box role="listitem" aria-label={label} sx={{ minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          bgcolor: PURPLE,
          color: '#fff',
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.5,
          py: 0.4,
        }}
      >
        {head}
      </Box>
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          py: 0.75,
          fontSize: 22,
          fontWeight: 900,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <Box component="span" sx={{ fontSize: 16 }}>
          {icon}
        </Box>
        {value}
      </Box>
    </Box>
  )
}

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
            color: boss ? '#fff' : INK,
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

        <Box
          sx={{
            position: 'relative',
            height: { xs: 190, sm: 220 },
            borderRadius: '16px',
            overflow: 'hidden',
            border: `3px solid ${INK}`,
            background: boss
              ? 'radial-gradient(circle at 50% 62%, #ffe0e6 0%, #ff8fa8 55%, #c2184a 100%)'
              : 'radial-gradient(circle at 50% 62%, #ffffff 0%, #d9ccff 50%, #7b55e8 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '-50%',
              background:
                'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.32) 0deg 10deg, rgba(255,255,255,0) 10deg 24deg)',
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
              {traits.map((k) => (
                <Box
                  key={k}
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: 'rgba(28,21,48,0.82)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {t(`game.${k}`)}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box
          role="list"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            border: `3px solid ${INK}`,
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: '#eef3ff',
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
            color="#0a6fb8"
            label={t('game.statPointLabel', { n: enemy.score })}
          />
          <StatCell
            head={t('game.statLost')}
            icon="♡"
            value={enemy.attack > 0 ? `-${String(enemy.attack)}` : '0'}
            color={enemy.attack > 0 ? RED : '#3a9a3a'}
            label={t('game.statLostLabel', { n: enemy.attack })}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ButtonBase
            autoFocus
            onClick={onStart}
            aria-label={t('game.startLabel', { n: state.level })}
            sx={{
              flex: 1,
              minHeight: 64,
              borderRadius: '16px',
              fontFamily: 'inherit',
              border: `4px solid ${INK}`,
              background: `linear-gradient(180deg, #9cf27a 0%, ${GREEN} 55%, #4fb52e 100%)`,
              boxShadow: `0 6px 0 ${GREEN_DEEP}, 0 6px 0 3px ${INK}`,
              transition: 'transform 80ms ease, box-shadow 80ms ease',
              animation: 'tontie-pulse 1.6s ease-in-out 700ms infinite',
              '&:active': {
                transform: 'translateY(5px)',
                boxShadow: `0 1px 0 ${GREEN_DEEP}, 0 1px 0 3px ${INK}`,
              },
              '&.Mui-focusVisible': {
                outline: `4px solid ${YELLOW}`,
                outlineOffset: 3,
              },
            }}
          >
            <Box
              component="span"
              sx={{ ...cartoonText('#fff', INK, 5), fontSize: 30 }}
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
              color: '#7a6f99',
              textAlign: 'left',
            }}
          >
            {t('game.startHint')}
          </Box>
        </Box>
      </Box>
    </Overlay>
  )
}

/** Each letter drops in with a small stagger, like the up_boad "up" tween. */
export function CartoonTitle({
  text,
  fill = YELLOW,
  size = 48,
}: {
  text: string
  fill?: string
  size?: number
}) {
  return (
    <Box
      component="h2"
      aria-label={text}
      sx={{
        m: 0,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        fontSize: { xs: size * 0.78, sm: size },
        ...cartoonText(fill, INK, 7),
        filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))',
      }}
    >
      {Array.from(
        new Intl.Segmenter().segment(text),
        (part) => part.segment,
      ).map((ch, i) => (
        <Box
          key={i}
          component="span"
          aria-hidden
          sx={{
            display: 'inline-block',
            whiteSpace: 'pre',
            animation: `tontie-letter-in 520ms ${String(i * 38)}ms cubic-bezier(.2,1.7,.4,1) both`,
          }}
        >
          {ch}
        </Box>
      ))}
    </Box>
  )
}

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
          bgcolor: '#e6e0ff',
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
  const t = Math.min(1, Math.max(0, (elapsed - delay) / COUNT_MS))
  return target * (1 - (1 - t) ** 3)
}

/** up_boad "up" → frame 67: LEVEL CLEAR!! and the level's hit / beat rates. */
export function LevelClearPanel({
  state,
  fx,
  now,
}: {
  state: GameState
  fx: GameFx
  now: number
}) {
  const { t } = useTranslation()
  const summary = state.lastClear
  if (!summary) return null
  const elapsed = now - fx.clearAt
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
              color: '#0a6fb8',
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
