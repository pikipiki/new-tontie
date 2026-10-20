import Box from '@mui/material/Box'
import type { TFunction } from 'i18next'
import type { ShopOffer } from '@game/shop'
import { CoinIcon, ShopIcon } from './ShopIcon'
import { cartoonText, INK, PAPER, RED, themeColors, YELLOW } from './theme'
import { SHOP_FLASH_MS } from '@game3d/fx'
import { ICON_SIZE } from './shopTheme'

function offerIconFilter(owned: boolean, affordable: boolean): string {
  if (owned) {
    return 'grayscale(0.9) brightness(0.8)'
  }
  if (affordable) {
    return 'none'
  }
  return 'grayscale(0.5) opacity(0.65)'
}

export function OfferIconStack({
  offer,
  owned,
  affordable,
}: {
  offer: ShopOffer
  owned: boolean
  affordable: boolean
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        width: 64,
        height: ICON_SIZE,
        '& svg': { width: ICON_SIZE, height: ICON_SIZE },
        filter: offerIconFilter(owned, affordable),
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 6,
          right: 6,
          bottom: -2,
          height: 12,
          borderRadius: '50%',
          background: themeColors.shopIconShadow,
          zIndex: 0,
        },
        '& > svg': { position: 'relative', zIndex: 1 },
      }}
    >
      <ShopIcon id={offer.id} />
    </Box>
  )
}

export function OfferPriceTag({
  price,
  affordable,
}: {
  price: number
  affordable: boolean
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.4,
        px: 1,
        borderRadius: '8px',
        border: `2px solid ${INK}`,
        bgcolor: PAPER,
        color: affordable ? INK : RED,
        fontSize: 15,
        fontWeight: 900,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <CoinIcon size={14} />
      {price}
    </Box>
  )
}

export function OfferOwnedRibbon({ t }: { t: TFunction }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: `calc(${ICON_SIZE} * 0.3)`,
        left: -4,
        right: -4,
        py: 0.25,
        transform: 'rotate(-8deg)',
        bgcolor: themeColors.greenOwned,
        border: `3px solid ${INK}`,
        borderRadius: '6px',
        fontSize: 13,
        fontWeight: 900,
        letterSpacing: 1,
      }}
    >
      ✓ {t('game.owned')}
    </Box>
  )
}

export function OfferBoughtFloat({ t }: { t: TFunction }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: -8,
        left: 0,
        right: 0,
        fontSize: 16,
        pointerEvents: 'none',
        ...cartoonText(YELLOW, INK, 4),
        animation: `tontie-float-up ${String(SHOP_FLASH_MS)}ms ease-out forwards`,
      }}
    >
      {t('game.bought')}
    </Box>
  )
}
