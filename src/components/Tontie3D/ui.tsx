import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import type { ReactNode } from 'react'
import { INK } from './theme'

export function GameButton({
  children,
  onClick,
  label,
  autoFocus,
  disabled,
  selected,
  variant = 'primary',
}: {
  children: ReactNode
  onClick: () => void
  label?: string
  autoFocus?: boolean
  disabled?: boolean
  selected?: boolean
  variant?: 'primary' | 'ghost' | 'icon'
}) {
  const icon = variant === 'icon'
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      autoFocus={autoFocus}
      disabled={disabled}
      sx={{
        minWidth: 48,
        minHeight: 48,
        px: icon ? 0 : 3,
        borderRadius: icon ? '50%' : 3,
        fontFamily: 'inherit',
        fontWeight: 900,
        fontSize: icon ? 22 : 18,
        letterSpacing: 0.5,
        color: variant === 'primary' ? INK : '#fff',
        bgcolor: variant === 'primary' ? '#ffe14d' : 'rgba(0,0,0,0.28)',
        border: variant === 'primary' ? `3px solid ${INK}` : 'none',
        boxShadow: variant === 'primary' ? `0 4px 0 ${INK}` : 'none',
        outline: selected ? '3px solid #fff' : 'none',
        transition: 'transform 80ms ease, box-shadow 80ms ease',
        '&:active': {
          transform: 'translateY(3px)',
          boxShadow: variant === 'primary' ? `0 1px 0 ${INK}` : 'none',
        },
        '&.Mui-focusVisible': { outline: '3px solid #fff', outlineOffset: 2 },
        '&.Mui-disabled': { opacity: 0.45 },
      }}
    >
      {children}
    </ButtonBase>
  )
}

/** Full-screen modal layer: dimmed, vignetted board behind a centred panel. */
export function Overlay({
  children,
  label,
  leaving = false,
  tone = 'dark',
}: {
  children: ReactNode
  label: string
  leaving?: boolean
  tone?: 'dark' | 'clear' | 'wood'
}) {
  const background =
    tone === 'clear'
      ? 'radial-gradient(ellipse at center, rgba(20,12,50,0.15) 0%, rgba(20,12,50,0.55) 100%)'
      : tone === 'wood'
        ? 'radial-gradient(ellipse at 50% 30%, rgba(60,30,10,0.55) 0%, rgba(25,10,0,0.88) 100%)'
        : 'radial-gradient(ellipse at center, rgba(28,18,64,0.45) 0%, rgba(12,8,30,0.82) 100%)'
  return (
    <Box
      role="dialog"
      aria-modal={!leaving}
      aria-label={label}
      aria-hidden={leaving || undefined}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
        pt: 'max(16px, env(safe-area-inset-top))',
        pb: 'max(16px, env(safe-area-inset-bottom))',
        background,
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        color: '#fff',
        textAlign: 'center',
        pointerEvents: leaving ? 'none' : 'auto',
        animation: leaving
          ? 'tontie-fade-out 520ms ease-in forwards'
          : 'tontie-fade-in 200ms ease-out',
      }}
    >
      {children}
    </Box>
  )
}
