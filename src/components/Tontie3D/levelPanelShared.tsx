import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { INK, PAPER, PURPLE, WHITE } from './theme'

export const PANEL_WIDTH = 'min(92vw, 400px)'

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/** Folder tab on the panel's top-right corner, as drawn on up_boad. */
export function LevelTab({
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

export function StatCell({
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
          color: WHITE,
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
