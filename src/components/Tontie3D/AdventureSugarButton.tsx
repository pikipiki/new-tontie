import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import type { TontieGame } from '@/hooks/useTontieGame'
import { FPS } from '@game/spec'
import { themeColors as colors } from './theme'

export function SugarButton({ game }: { game: TontieGame }) {
  const adventure = game.state.adventure
  if (!adventure) return null
  const ready = adventure.charge === 4
  const active = adventure.frenzyFrames > 0
  return (
    <ButtonBase
      onClick={game.sugarRush}
      disabled={!ready || game.state.phase !== 'playing'}
      aria-label={`Sugar Rush, ${String(adventure.charge)} of 4 charges${active ? ', frenzy active' : ''}`}
      sx={{
        flexShrink: 0,
        minWidth: 125,
        minHeight: 55,
        px: 1.2,
        borderRadius: '15px',
        border: `1px solid ${ready ? colors.yellow : colors.overlayBorder}`,
        bgcolor: ready ? colors.yellow : colors.overlayBg,
        color: ready ? colors.ink : colors.white,
        display: 'grid',
        justifyItems: 'center',
        alignContent: 'center',
        gap: 0.4,
        '&.Mui-disabled': { color: colors.cream },
        '&:focus-visible': { outline: `3px solid ${colors.white}` },
      }}
    >
      <Box component="span" sx={{ fontSize: 12, fontWeight: 900 }}>
        {active
          ? `⚡ RUSH ${String(Math.ceil(adventure.frenzyFrames / FPS))}s`
          : '🍩 SUGAR RUSH'}
      </Box>
      <Box component="span" sx={{ display: 'flex', gap: 0.5 }}>
        {[0, 1, 2, 3].map((charge) => (
          <Box
            key={charge}
            component="span"
            sx={{
              width: 20,
              height: 6,
              borderRadius: 2,
              bgcolor:
                charge < adventure.charge
                  ? colors.cabinetPink
                  : colors.purpleInk,
            }}
          />
        ))}
      </Box>
    </ButtonBase>
  )
}
