import { GOLD, INK, RED, themeColors, WHITE } from './theme'

const HEART =
  'M32 54 C 8 38, 6 22, 18 15 C 25 11, 31 15, 32 20 C 33 15, 39 11, 46 15 C 58 22, 56 38, 32 54 Z'

const HAMMER_PALETTES = themeColors.shopHammerPalettes

function Hammer({ id }: { id: keyof typeof HAMMER_PALETTES }) {
  const colors = HAMMER_PALETTES[id]
  return (
    <g
      transform="rotate(-28 32 32)"
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    >
      <rect
        x={28}
        y={26}
        width={8}
        height={32}
        rx={3}
        fill={themeColors.shopIcon.hammerWood}
      />
      <rect
        x={27}
        y={46}
        width={10}
        height={10}
        rx={3}
        fill={themeColors.shopIcon.hammerBand}
      />
      <rect x={8} y={9} width={48} height={21} rx={7} fill={colors.body} />
      <rect x={15} y={9} width={6} height={21} fill={colors.band} />
      <rect x={43} y={9} width={6} height={21} fill={colors.band} />
      <rect
        x={23}
        y={13}
        width={17}
        height={4}
        rx={2}
        fill={colors.shine}
        stroke="none"
        opacity={0.85}
      />
    </g>
  )
}

function Heart({
  posX = 0,
  posY = 0,
  scaleFactor = 1,
  fill = RED,
}: {
  posX?: number
  posY?: number
  scaleFactor?: number
  fill?: string
}) {
  return (
    <g
      transform={`translate(${String(posX)} ${String(posY)}) scale(${String(scaleFactor)})`}
    >
      <path
        d={HEART}
        fill={fill}
        stroke={INK}
        strokeWidth={3 / scaleFactor}
        strokeLinejoin="round"
      />
      <ellipse
        cx={21}
        cy={23}
        rx={5}
        ry={3.5}
        fill={WHITE}
        opacity={0.75}
        transform="rotate(-30 21 23)"
      />
    </g>
  )
}

function Wing() {
  return (
    <g
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path
        d="M10 40 C 12 22, 28 10, 54 10 C 52 18, 48 22, 42 24 C 48 26, 46 32, 38 34 C 42 38, 36 42, 28 42 C 30 48, 20 52, 10 40 Z"
        fill={WHITE}
      />
      <path
        d="M18 38 C 26 32, 34 26, 46 16"
        fill="none"
        stroke={themeColors.shopIcon.potionStroke}
        strokeWidth={2.5}
      />
      <path
        d="M24 40 C 28 36, 32 34, 36 33"
        fill="none"
        stroke={themeColors.shopIcon.potionStroke}
        strokeWidth={2.5}
      />
    </g>
  )
}

function Continue() {
  return (
    <g stroke={INK} strokeWidth={3}>
      <circle cx={32} cy={32} r={22} fill={themeColors.greenHeart} />
      <circle
        cx={32}
        cy={32}
        r={15}
        fill={themeColors.greenHeartLight}
        stroke="none"
        opacity={0.6}
      />
      <text
        x={32}
        y={39}
        textAnchor="middle"
        fontSize={19}
        fontWeight={900}
        fill={WHITE}
        stroke={INK}
        strokeWidth={3}
        paintOrder="stroke"
        fontFamily="Nunito, system-ui, sans-serif"
      >
        1UP
      </text>
    </g>
  )
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${String(x)} ${String(y - 7)} L${String(x + 2)} ${String(y - 2)} L${String(x + 7)} ${String(y)} L${String(x + 2)} ${String(y + 2)} L${String(x)} ${String(y + 7)} L${String(x - 2)} ${String(y + 2)} L${String(x - 7)} ${String(y)} L${String(x - 2)} ${String(y - 2)} Z`}
      fill={themeColors.yellowPale}
      stroke={INK}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

/** Gold coin (the money counter's coin_get pickup). */
export function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      style={{ flex: 'none', display: 'block' }}
    >
      <circle
        cx={12}
        cy={12}
        r={10}
        fill={GOLD}
        stroke={INK}
        strokeWidth={2.4}
      />
      <circle
        cx={12}
        cy={12}
        r={6.2}
        fill="none"
        stroke={themeColors.shopIcon.coinStroke}
        strokeWidth={2}
      />
      <path
        d="M8.5 8.5 A5 5 0 0 1 13 6.8"
        fill="none"
        stroke={themeColors.cream}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Vector art for each shop offer (hammers by tier, hearts by size, wing, continue). */
export function ShopIcon({ id, size = 56 }: { id: string; size?: number }) {
  let art
  switch (id) {
    case 'hammer2':
    case 'hammer3':
    case 'hammer4':
      art = <Hammer id={id} />
      break
    case 'heart1':
      art = <Heart posX={6} posY={4} scaleFactor={0.82} />
      break
    case 'heart2':
      art = (
        <>
          <Heart
            posX={-2}
            posY={8}
            scaleFactor={0.68}
            fill={themeColors.shopIcon.heartPink}
          />
          <Heart posX={18} posY={2} scaleFactor={0.72} />
        </>
      )
      break
    case 'heart3':
      art = (
        <>
          <Heart posX={0} posY={-2} scaleFactor={1} />
          <Sparkle x={52} y={14} />
          <Sparkle x={12} y={50} />
        </>
      )
      break
    case 'wing':
      art = <Wing />
      break
    default:
      art = <Continue />
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      focusable="false"
    >
      {art}
    </svg>
  )
}
