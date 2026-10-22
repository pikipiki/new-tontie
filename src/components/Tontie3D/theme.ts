/**
 * MUI / overlay styling built on the shared game palette (`@game3d/theme`).
 */
export {
  themeColors,
  INK,
  SKY,
  CABINET_PINK,
  CABINET_PINK_DEEP,
  CABINET_VIOLET,
  LED_SCREEN,
  LED_RED,
  PURPLE,
  PURPLE_DEEP,
  YELLOW,
  ORANGE,
  GREEN,
  GREEN_DEEP,
  RED,
  PAPER,
  GOLD,
  WHITE,
} from '@game3d/theme'

import { themeColors } from '@game3d/theme'

/** Phones held sideways: too short for a header and footer above and below the board. */
export const SHORT_LANDSCAPE =
  '@media (max-height: 500px) and (orientation: landscape)'

export const WOOD_GRADIENT = `repeating-linear-gradient(92deg, ${themeColors.shopWoodStripe} 0 2px, rgba(0,0,0,0) 2px 11px), linear-gradient(180deg, ${themeColors.shopWoodTop} 0%, ${themeColors.shopWoodBottom} 100%)`
export const WOOD_DARK_GRADIENT = `repeating-linear-gradient(92deg, ${themeColors.shopWoodDarkStripe} 0 2px, rgba(0,0,0,0) 2px 9px), linear-gradient(180deg, ${themeColors.shopWoodDarkTop} 0%, ${themeColors.shopWoodDarkBottom} 100%)`

export const INTRO_BOSS_STAGE_BG = `radial-gradient(circle at 50% 62%, ${themeColors.redBossLight} 0%, ${themeColors.redPinkMid} 55%, ${themeColors.redDeep} 100%)`
export const INTRO_MONSTER_STAGE_BG = `radial-gradient(circle at 50% 62%, ${themeColors.introWhite} 0%, ${themeColors.introLilac} 50%, ${themeColors.purpleSoft} 100%)`
export const INTRO_STAGE_SPIN = `repeating-conic-gradient(from 0deg, ${themeColors.introSpinWhite} 0deg 10deg, ${themeColors.introSpinClear} 10deg 24deg)`
export const INTRO_START_GRADIENT = `linear-gradient(180deg, ${themeColors.greenLight} 0%, ${themeColors.green} 55%, ${themeColors.greenMid} 100%)`
export const SHOP_EXIT_GRADIENT = `linear-gradient(180deg, ${themeColors.shopExitGradientTop}, ${themeColors.red})`

export const OVERLAY_BG_CLEAR = `radial-gradient(ellipse at center, ${themeColors.uiOverlayPurpleLight} 0%, ${themeColors.uiOverlayPurpleMid} 100%)`
export const OVERLAY_BG_WOOD = `radial-gradient(ellipse at 50% 30%, ${themeColors.uiOverlayWood} 0%, ${themeColors.uiOverlayWoodDeep} 100%)`
export const OVERLAY_BG_DARK = `radial-gradient(ellipse at center, ${themeColors.uiOverlayViolet} 0%, ${themeColors.uiOverlayVioletDeep} 100%)`

export const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
} as const

/** Screen-reader grid controls that become visible when focused (WCAG 2.4.7). */
export const srOnlyFocusable = {
  ...srOnly,
  '&:focus-visible': {
    position: 'fixed',
    left: 16,
    bottom: 96,
    width: 'auto',
    height: 'auto',
    margin: 0,
    padding: '10px 14px',
    overflow: 'visible',
    clip: 'auto',
    clipPath: 'none',
    whiteSpace: 'nowrap',
    zIndex: 150,
    borderRadius: '12px',
    border: `3px solid ${themeColors.ink}`,
    bgcolor: themeColors.paper,
    color: themeColors.ink,
    fontWeight: 800,
    fontSize: 14,
    boxShadow: `0 4px 0 ${themeColors.ink}`,
    outline: `3px solid ${themeColors.focusHighContrast}`,
    outlineOffset: 2,
  },
} as const

/** Chunky cartoon lettering: fill + thick ink stroke painted under the fill. */
export function cartoonText(
  fill: string,
  stroke: string = themeColors.ink,
  width = 6,
) {
  return {
    color: fill,
    WebkitTextStroke: `${String(width)}px ${stroke}`,
    paintOrder: 'stroke fill',
    textShadow: `0 ${String(Math.round(width * 0.8))}px 0 ${stroke}`,
    fontWeight: 900,
    letterSpacing: '-0.01em',
    lineHeight: 1,
  } as const
}

/** The white folder card of up_boad with its thick ink outline. */
export const panelCard = {
  position: 'relative',
  bgcolor: themeColors.paper,
  border: `4px solid ${themeColors.ink}`,
  borderRadius: '22px',
  boxShadow: `0 8px 0 ${themeColors.ink}, 0 26px 50px ${themeColors.panelShadow}`,
  color: themeColors.ink,
} as const
