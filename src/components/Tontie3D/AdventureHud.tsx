import type { AdventureState } from '@game/adventure/types'
import Box from '@mui/material/Box'
import { SugarButton } from './AdventureSugarButton'
import type { TontieGame } from '@/hooks/useTontieGame'
import { missionFor } from '@game/adventure/content'
import { themeColors as colors } from './theme'

export function AdventureHud({ game }: { game: TontieGame }) {
  const adventure = game.state.adventure
  if (!adventure || !game.started) return null
  const mission = missionFor(adventure.stage)
  let detail = `${String(Math.min(adventure.progress, mission.goal))} / ${String(mission.goal)}`
  if (mission.kind === 'cake')
    detail += ` · 🎂 ${String(adventure.cake)} slices`
  if (mission.kind === 'choir')
    detail += ` · Noise ${String(adventure.noise)} / 5`
  if (adventure.boss)
    detail += adventure.boss.warning ? ' · WAIT…' : ' · STRIKE GOLD!'
  return (
    <Box
      sx={{
        flexShrink: 0,
        px: 2,
        pt: 'max(7px, env(safe-area-inset-top))',
        pb: 0.5,
        width: 'min(100%, 760px)',
        mx: 'auto',
        boxSizing: 'border-box',
        color: colors.white,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.5,
              color: colors.cabinetPink,
            }}
          >
            ADVENTURE {adventure.stage} / 6 · ★ {game.state.score}
          </Box>
          <Box
            sx={{
              fontSize: { xs: 14, sm: 18 },
              fontWeight: 900,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {mission.title}
          </Box>
          <Box sx={{ fontSize: 12, color: colors.cream, fontWeight: 800 }}>
            {detail}
          </Box>
          <Box
            role="progressbar"
            aria-label="Mission progress"
            aria-valuenow={adventure.progress}
            aria-valuemin={0}
            aria-valuemax={mission.goal}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              bgcolor: colors.purpleInk,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${String(Math.min(100, (adventure.progress / mission.goal) * 100))}%`,
                height: '100%',
                bgcolor: colors.cabinetPink,
                transition: 'width 150ms',
              }}
            />
          </Box>
        </Box>
        <SugarButton game={game} />
      </Box>
      <AdventureNotice adventure={adventure} />
    </Box>
  )
}

function AdventureNotice({ adventure }: { adventure: AdventureState }) {
  const active = adventure.frenzyFrames > 0
  let message =
    adventure.noticeFrames > 0
      ? adventure.notice
      : 'Rest to eat & charge • Tap to fly & strike'
  if (adventure.stolenWeapon)
    message =
      adventure.stolenWeapon.holder === null
        ? 'DISARMED · Tap your dropped weapon to recover it'
        : 'DISARMED · Tap the Goonk carrying your weapon'
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        height: 18,
        mt: 0.4,
        fontSize: 11,
        fontWeight: 700,
        color: active ? colors.yellow : colors.cabinetPink,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {message}
    </Box>
  )
}
