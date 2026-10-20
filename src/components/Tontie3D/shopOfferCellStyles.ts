import type { SxProps, Theme } from '@mui/material/styles'
import { SHOP_FLASH_MS } from '@game3d/fx'
import { INK, themeColors, WHITE, YELLOW } from './theme'
import { CELL_HEIGHT, WOOD } from './shopTheme'

export function shopOfferFlashAnimation(
  flash: { offer: number; at: number; ok: boolean } | null,
  index: number,
  clock: number,
): string {
  const flashing =
    flash !== null && flash.offer === index && clock - flash.at < SHOP_FLASH_MS
  if (!flashing) return 'none'
  return flash.ok
    ? 'tontie-pop 420ms cubic-bezier(.2,1.8,.4,1)'
    : 'tontie-shake 360ms ease-in-out'
}

export function offerCellShellSx(
  selected: boolean,
  animation: string,
): SxProps<Theme> {
  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.25,
    minHeight: CELL_HEIGHT,
    pt: 0.75,
    pb: 0.75,
    px: 0.5,
    borderRadius: '16px',
    border: `3px solid ${INK}`,
    background: WOOD,
    boxShadow: selected
      ? `0 0 0 4px ${YELLOW}, 0 6px 0 ${INK}`
      : `0 5px 0 ${INK}`,
    color: WHITE,
    fontFamily: 'inherit',
    transform: selected ? 'translateY(-3px)' : 'none',
    transition: 'transform 120ms ease, box-shadow 120ms ease',
    animation,
    '&:active': {
      transform: 'translateY(3px)',
      boxShadow: `0 2px 0 ${INK}`,
    },
    '&.Mui-focusVisible': {
      boxShadow: `0 0 0 4px ${YELLOW}, 0 6px 0 ${INK}`,
      outline: `3px solid ${themeColors.focusHighContrast}`,
      outlineOffset: 2,
    },
  }
}
