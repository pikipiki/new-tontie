import Box from '@mui/material/Box'
import type { TontieGame } from '@/hooks/useTontieGame'
import { HOLE_ORDER } from '@game/layout'
import { themeColors as colors } from './theme'

/** Short white contact flash, coloured edge echoes and speed lines, never intercepting input. */
export function ArcadeScreenFx({ game }: { game: TontieGame }) {
  const hits = HOLE_ORDER.map((hole) =>
    Math.max(game.gameFx.holes[hole].killAt, game.gameFx.holes[hole].hitAt),
  )
  const latest = Math.max(...hits)
  const laser =
    game.gameFx.laser && Math.abs(game.gameFx.laser.at - latest) < 120
  const impact = latest + (laser ? 0 : 420)
  const age = game.clock - impact
  const rush = Boolean(
    game.state.adventure && game.state.adventure.frenzyFrames > 0,
  )
  if (age < 0 || age > 700) return null
  return (
    <Box
      key={Math.floor(impact / 400)}
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        animation: 'arcade-contact 650ms ease-out both',
        '@keyframes arcade-contact': {
          '0%': { opacity: 0 },
          '5%': { opacity: 1 },
          '25%': { opacity: 0.65 },
          '100%': { opacity: 0 },
        },
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, transparent 25%, ${colors.hudAccentCyan} 170%)`,
          boxShadow: `inset 0 0 65px ${rush ? colors.cabinetPink : colors.hudAccentCyan}`,
          opacity: 0.5,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: colors.white,
          animation: 'arcade-flash 140ms ease-out both',
          '@keyframes arcade-flash': {
            '0%': { opacity: 0.16 },
            '100%': { opacity: 0 },
          },
        }}
      />
      {Array.from({ length: 10 }, (_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            left: index < 5 ? '-5%' : '85%',
            top: `${String(20 + (index % 5) * 13)}%`,
            width: '20%',
            height: 2,
            bgcolor: index % 2 ? colors.cabinetPink : colors.hudAccentCyan,
            transform: `rotate(${String(index < 5 ? -14 : 14)}deg)`,
            boxShadow: `0 0 12px ${colors.hudAccentCyan}`,
          }}
        />
      ))}
    </Box>
  )
}
