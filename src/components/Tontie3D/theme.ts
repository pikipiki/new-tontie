/** EYEZMAZE up_boad palette: black ink outlines, purple tab text, yellow lettering. */
export const INK = '#1c1530'
/** Dim arcade hall behind the plush cabinet. */
export const SKY = '#24123a'
/** Plush cabinet: pink velour bezel, violet trim, black LED screens with red segments. */
export const CABINET_PINK = '#f29ad0'
export const CABINET_PINK_DEEP = '#d86aae'
export const CABINET_VIOLET = '#6a3cc0'
export const LED_SCREEN = '#16070f'
export const LED_RED = '#ff3a2e'
export const PURPLE = '#6a1bff'
export const PURPLE_DEEP = '#4b0fc0'
export const YELLOW = '#ffd21f'
export const ORANGE = '#ff8a00'
export const GREEN = '#6fd34a'
export const GREEN_DEEP = '#2f8a1f'
export const RED = '#ff3b6b'
export const PAPER = '#fffdf7'
export const GOLD = '#ffc928'

export const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const

/** Chunky cartoon lettering: fill + thick ink stroke painted under the fill. */
export function cartoonText(fill: string, stroke = INK, width = 6) {
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
  bgcolor: PAPER,
  border: `4px solid ${INK}`,
  borderRadius: '22px',
  boxShadow: `0 8px 0 ${INK}, 0 26px 50px rgba(0,0,0,0.45)`,
  color: INK,
} as const
