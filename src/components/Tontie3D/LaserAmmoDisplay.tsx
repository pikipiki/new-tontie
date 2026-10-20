import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { LASER_AMMO } from '@game/spec'
import { themeColors } from './theme'

/** A neon arcade cartridge: large digits and ten charge cells, with an amber/red reserve. */
export function LaserAmmoDisplay({ ammo }: { ammo: number }) {
  const { t } = useTranslation()
  const remaining = Math.max(0, Math.min(LASER_AMMO, ammo))
  const accent =
    remaining <= 10 ? themeColors.ledRedBright : themeColors.hudAccentCyan
  return (
    <Box
      role="img"
      aria-label={t('game.gun', { n: remaining })}
      sx={{
        width: '100%',
        maxWidth: 200,
        mx: 'auto',
        boxSizing: 'border-box',
        px: 0.8,
        py: 0.45,
        border: `1px solid ${accent}`,
        borderRadius: '9px',
        background: `linear-gradient(145deg, ${themeColors.ledScreen}, ${themeColors.purpleInk})`,
        boxShadow: `inset 0 0 12px ${themeColors.hudBarShadow}`,
        color: accent,
        textShadow: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 0.5,
        }}
      >
        <Box
          component="span"
          sx={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.8 }}
        >
          {remaining === 0 ? 'EMPTY' : 'LASER'}
        </Box>
        <Box
          component="span"
          sx={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,
            textShadow: `0 0 10px ${accent}`,
          }}
        >
          {String(remaining).padStart(2, '0')}
          <Box component="span" sx={{ fontSize: 10, opacity: 0.7 }}>
            /{LASER_AMMO}
          </Box>
        </Box>
      </Box>
      <Box aria-hidden sx={{ display: 'flex', gap: '2px', mt: 0.5 }}>
        {Array.from({ length: 10 }, (_, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: '1px',
              bgcolor: remaining > index * 5 ? accent : themeColors.ledOff,
              boxShadow: remaining > index * 5 ? `0 0 4px ${accent}` : 'none',
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
