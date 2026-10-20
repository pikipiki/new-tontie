import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { useTranslation } from 'react-i18next'
import { offerHammerLv, offerOwned, SHOP_OFFERS } from '@game/shop'
import { hammerDamage } from '@game/spec'
import { SHOP_FLASH_MS } from '@game3d/fx'
import { SHOP_EXIT_INDEX, type TontieGame } from '@/hooks/useTontieGame'
import {
  cartoonText,
  INK,
  PAPER,
  SHOP_EXIT_GRADIENT,
  themeColors,
  WHITE,
  YELLOW,
} from './theme'
import { CELL_HEIGHT, WOOD_DARK } from './shopTheme'
import { KeyBadge } from './shopWidgets'
import {
  OfferBoughtFloat,
  OfferIconStack,
  OfferOwnedRibbon,
  OfferPriceTag,
} from './shopOfferCellParts'
import {
  offerCellShellSx,
  shopOfferFlashAnimation,
} from './shopOfferCellStyles'

export function OfferCell({
  game,
  index,
}: {
  game: TontieGame
  index: number
}) {
  const { t } = useTranslation()
  const offer = SHOP_OFFERS[index]
  if (!offer) return null
  const { state } = game
  const owned = offerOwned(state, offer)
  const affordable = state.money >= offer.price
  const selected = game.shopIndex === index
  const name = t(`shopOffers.${offer.id}`)
  const flash = game.gameFx.shop
  const animation = shopOfferFlashAnimation(flash, index, game.clock)
  const flashing =
    flash !== null &&
    flash.offer === index &&
    game.clock - flash.at < SHOP_FLASH_MS

  return (
    <ButtonBase
      key={flash?.offer === index ? flash.at : 'idle'}
      onClick={() => {
        game.buy(index)
      }}
      onFocus={() => {
        game.selectShop(index)
      }}
      aria-label={
        owned
          ? `${name} — ${t('game.owned')}`
          : t('game.buy', { label: name, price: offer.price })
      }
      disabled={owned || !affordable}
      aria-disabled={owned || !affordable}
      sx={offerCellShellSx(selected, animation)}
    >
      <KeyBadge>{index + 1}</KeyBadge>
      <OfferIconStack offer={offer} owned={owned} affordable={affordable} />
      <Box
        sx={{
          fontSize: 12.5,
          fontWeight: 900,
          lineHeight: 1.1,
          minHeight: 26,
          display: 'flex',
          alignItems: 'center',
          textShadow: `0 2px 0 ${themeColors.shopTextShadow}`,
        }}
      >
        {name}
      </Box>
      <OfferPriceTag price={offer.price} affordable={affordable} />
      {owned && <OfferOwnedRibbon t={t} />}
      {flashing && flash.ok && <OfferBoughtFloat t={t} />}
    </ButtonBase>
  )
}

export function ExitCell({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  const selected = game.shopIndex === SHOP_EXIT_INDEX
  return (
    <ButtonBase
      autoFocus
      onClick={game.leaveShop}
      onFocus={() => {
        game.selectShop(SHOP_EXIT_INDEX)
      }}
      aria-label={t('game.exitShopLabel')}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        minHeight: CELL_HEIGHT,
        borderRadius: '16px',
        border: `3px solid ${INK}`,
        background: WOOD_DARK,
        boxShadow: selected
          ? `0 0 0 4px ${YELLOW}, 0 6px 0 ${INK}`
          : `0 5px 0 ${INK}`,
        fontFamily: 'inherit',
        transform: selected ? 'translateY(-3px)' : 'none',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        '&:active': {
          transform: 'translateY(3px)',
          boxShadow: `0 2px 0 ${INK}`,
        },
        '&.Mui-focusVisible': {
          boxShadow: `0 0 0 4px ${YELLOW}, 0 6px 0 ${INK}`,
          outline: `3px solid ${themeColors.focusHighContrast}`,
          outlineOffset: 2,
        },
      }}
    >
      <KeyBadge>0</KeyBadge>
      <Box
        aria-hidden
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          border: `3px solid ${INK}`,
          background: SHOP_EXIT_GRADIENT,
          boxShadow: `0 4px 0 ${INK}`,
          display: 'grid',
          placeItems: 'center',
          fontSize: 26,
          ...cartoonText(WHITE, INK, 4),
        }}
      >
        ➜
      </Box>
      <Box sx={{ fontSize: 16, ...cartoonText(WHITE, INK, 4) }}>
        {t('game.exitShop')}
      </Box>
    </ButtonBase>
  )
}

export function Description({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  const offer = SHOP_OFFERS[game.shopIndex]
  const hammerLevel = offer ? offerHammerLv(offer) : null
  let text = t('game.shopHint')
  if (offer) {
    const owned = offerOwned(game.state, offer)
    const poor = game.state.money < offer.price
    const offerTitle = t(`shopOffers.${offer.id}`)
    const descKey = `shopDesc.${offer.id}`
    const damage = hammerLevel === null ? 1 : hammerDamage(hammerLevel)
    text = `${offerTitle} — ${t(descKey, { dmg: damage })}`
    if (owned) text += ` (${t('game.owned')})`
    else if (poor) text += ` (${t('game.tooExpensive')})`
  }
  return (
    <Box
      aria-live="polite"
      sx={{
        width: 'min(94vw, 420px)',
        minHeight: 44,
        px: 1.5,
        py: 1,
        borderRadius: '12px',
        border: `3px solid ${INK}`,
        bgcolor: PAPER,
        color: INK,
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1.25,
        boxShadow: `0 4px 0 ${INK}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {text}
    </Box>
  )
}
