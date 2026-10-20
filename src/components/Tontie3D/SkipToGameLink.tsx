import Link from '@mui/material/Link'
import { useTranslation } from 'react-i18next'
import { INK, PAPER, themeColors } from './theme'

/** WCAG 2.4.1 / RGAA 12.7 — bypass block, visible on keyboard focus. */
export function SkipToGameLink() {
  const { t } = useTranslation()
  return (
    <Link
      href="#tontie-game-main"
      underline="none"
      sx={{
        position: 'fixed',
        left: 12,
        top: 12,
        zIndex: 200,
        transform: 'translateY(-160%)',
        px: 2,
        py: 1.5,
        borderRadius: '12px',
        border: `4px solid ${INK}`,
        bgcolor: PAPER,
        color: INK,
        fontWeight: 900,
        fontSize: 16,
        boxShadow: `0 4px 0 ${INK}`,
        transition: 'transform 120ms ease',
        '&:focus-visible': {
          transform: 'translateY(0)',
          outline: `3px solid ${themeColors.focusHighContrast}`,
          outlineOffset: 3,
        },
      }}
    >
      {t('a11y.skipToGame')}
    </Link>
  )
}
