import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { offerHammerLv, offerOwned, SHOP_OFFERS } from '@/game/shop'
import { hammerDamage } from '@/game/spec'
import { SHOP_FLASH_MS } from '@/game3d/fx'
import { SHOP_EXIT_INDEX, type TontieGame } from '@/hooks/useTontieGame'
import { CoinIcon, ShopIcon } from './ShopIcon'
import { cartoonText, INK, PAPER, RED, YELLOW } from './theme'
import { Overlay } from './ui'

const CELL_HEIGHT = 'clamp(98px, 15.5vh, 140px)'
const ICON_SIZE = 'clamp(36px, 6.4vh, 54px)'

const WOOD =
  'repeating-linear-gradient(92deg, rgba(60,25,5,0.10) 0 2px, rgba(0,0,0,0) 2px 11px), linear-gradient(180deg, #c48247 0%, #9a5d2c 100%)'
const WOOD_DARK =
  'repeating-linear-gradient(92deg, rgba(0,0,0,0.12) 0 2px, rgba(0,0,0,0) 2px 9px), linear-gradient(180deg, #7a4520 0%, #5a3014 100%)'

function KeyBadge({ children }: { children: ReactNode }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 5,
        left: 5,
        minWidth: 20,
        height: 20,
        px: 0.5,
        borderRadius: '6px',
        bgcolor: 'rgba(28,21,48,0.55)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 900,
        lineHeight: '20px',
        display: { xs: 'none', sm: 'block' },
      }}
    >
      {children}
    </Box>
  )
}

/** Swinging wooden sign over the stall. */
function ShopSign() {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        position: 'relative',
        pt: 'clamp(10px, 2.4vh, 24px)',
        transformOrigin: '50% 0',
        animation: 'tontie-sway 3.2s ease-in-out infinite',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: '18%',
          right: '18%',
          height: 'clamp(16px, 3vh, 30px)',
          borderLeft: `3px solid ${INK}`,
          borderRight: `3px solid ${INK}`,
        }}
      />
      <Box
        component="h2"
        sx={{
          m: 0,
          px: 3,
          py: 1,
          borderRadius: '14px',
          border: `4px solid ${INK}`,
          background: WOOD,
          boxShadow: `0 6px 0 ${INK}, inset 0 3px 0 rgba(255,255,255,0.25)`,
          ...cartoonText(YELLOW, INK, 6),
          fontSize: 'clamp(24px, 4.6vh, 36px)',
        }}
      >
        {t('game.shopTitle')}
      </Box>
    </Box>
  )
}

function Wallet({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  const flash = game.fx.shop
  const sold =
    flash !== null && flash.ok && game.clock - flash.at < SHOP_FLASH_MS
      ? flash
      : null
  const price = sold ? SHOP_OFFERS[sold.offer]?.price : undefined
  return (
    <Box
      role="status"
      aria-label={t('game.money', { n: game.state.money })}
      sx={{ position: 'relative' }}
    >
      <Box
        key={sold ? sold.at : 'idle'}
        aria-hidden
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 0.5,
          borderRadius: 999,
          border: `3px solid ${INK}`,
          bgcolor: PAPER,
          color: INK,
          boxShadow: `0 4px 0 ${INK}`,
          fontWeight: 900,
          animation: sold
            ? 'tontie-pop 380ms cubic-bezier(.2,1.8,.4,1)'
            : 'none',
        }}
      >
        <Box
          component="span"
          sx={{ fontSize: 12, color: '#7a6f99', letterSpacing: 0.5 }}
        >
          {t('game.shopWallet')}
        </Box>
        <CoinIcon size={22} />
        <Box
          component="span"
          sx={{ fontSize: 24, fontVariantNumeric: 'tabular-nums' }}
        >
          {game.state.money}
        </Box>
      </Box>
      {sold && price !== undefined && (
        <Box
          key={`float-${String(sold.at)}`}
          aria-hidden
          sx={{
            position: 'absolute',
            right: -6,
            top: -6,
            fontSize: 20,
            pointerEvents: 'none',
            ...cartoonText(RED, INK, 4),
            animation: `tontie-float-up ${String(SHOP_FLASH_MS)}ms ease-out forwards`,
          }}
        >
          -{price}
        </Box>
      )}
    </Box>
  )
}

function OfferCell({ game, index }: { game: TontieGame; index: number }) {
  const { t } = useTranslation()
  const offer = SHOP_OFFERS[index]
  if (!offer) return null
  const { state } = game
  const owned = offerOwned(state, offer)
  const affordable = state.money >= offer.price
  const selected = game.shopIndex === index
  const name = t(`shopOffers.${offer.id}`)
  const flash = game.fx.shop
  const flashing =
    flash !== null &&
    flash.offer === index &&
    game.clock - flash.at < SHOP_FLASH_MS
  const animation = flashing
    ? flash.ok
      ? 'tontie-pop 420ms cubic-bezier(.2,1.8,.4,1)'
      : 'tontie-shake 360ms ease-in-out'
    : 'none'

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
      aria-disabled={owned || !affordable}
      sx={{
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
        color: '#fff',
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
        },
      }}
    >
      <KeyBadge>{index + 1}</KeyBadge>
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          width: 64,
          height: ICON_SIZE,
          '& svg': { width: ICON_SIZE, height: ICON_SIZE },
          filter: owned
            ? 'grayscale(0.9) brightness(0.8)'
            : affordable
              ? 'none'
              : 'grayscale(0.5) opacity(0.65)',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 6,
            right: 6,
            bottom: -2,
            height: 12,
            borderRadius: '50%',
            background: 'rgba(40,15,0,0.45)',
            zIndex: 0,
          },
          '& > svg': { position: 'relative', zIndex: 1 },
        }}
      >
        <ShopIcon id={offer.id} />
      </Box>
      <Box
        sx={{
          fontSize: 12.5,
          fontWeight: 900,
          lineHeight: 1.1,
          minHeight: 26,
          display: 'flex',
          alignItems: 'center',
          textShadow: `0 2px 0 rgba(0,0,0,0.35)`,
        }}
      >
        {name}
      </Box>
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
        {offer.price}
      </Box>
      {owned && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: `calc(${ICON_SIZE} * 0.3)`,
            left: -4,
            right: -4,
            py: 0.25,
            transform: 'rotate(-8deg)',
            bgcolor: '#3fbf5a',
            border: `3px solid ${INK}`,
            borderRadius: '6px',
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          ✓ {t('game.owned')}
        </Box>
      )}
      {flashing && flash.ok && (
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
      )}
    </ButtonBase>
  )
}

function ExitCell({ game }: { game: TontieGame }) {
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
          background: `linear-gradient(180deg, #ff7d9a, ${RED})`,
          boxShadow: `0 4px 0 ${INK}`,
          display: 'grid',
          placeItems: 'center',
          fontSize: 26,
          ...cartoonText('#fff', INK, 4),
        }}
      >
        ➜
      </Box>
      <Box sx={{ fontSize: 16, ...cartoonText('#fff', INK, 4) }}>
        {t('game.exitShop')}
      </Box>
    </ButtonBase>
  )
}

function Description({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  const offer = SHOP_OFFERS[game.shopIndex]
  const lv = offer ? offerHammerLv(offer) : null
  let text = t('game.shopHint')
  if (offer) {
    const owned = offerOwned(game.state, offer)
    const poor = game.state.money < offer.price
    text = `${t(`shopOffers.${offer.id}`)} — ${t(`shopDesc.${offer.id}`, {
      dmg: lv === null ? 1 : hammerDamage(lv),
    })}`
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

/** The merchant's stall: 3×3 wooden shelf like the brown shop board, items on pedestals with price tags. */
export function ShopPanel({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  return (
    <Overlay label={t('game.shop')} tone="wood">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(6px, 1.4vh, 14px)',
          width: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          py: 0.5,
          animation: 'tontie-panel-in 520ms cubic-bezier(.2,1.5,.4,1) both',
        }}
      >
        <ShopSign />
        <Wallet game={game} />
        <Box
          role="group"
          aria-label={t('game.shop')}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: { xs: 1, sm: 1.25 },
            width: 'min(94vw, 420px)',
            p: { xs: 1, sm: 1.25 },
            borderRadius: '20px',
            border: `4px solid ${INK}`,
            background: WOOD_DARK,
            boxShadow: `0 8px 0 ${INK}, inset 0 0 0 3px rgba(255,210,140,0.18), 0 24px 40px rgba(0,0,0,0.4)`,
          }}
        >
          {SHOP_OFFERS.map((offer, i) => (
            <OfferCell key={offer.id} game={game} index={i} />
          ))}
          <ExitCell game={game} />
        </Box>
        <Description game={game} />
      </Box>
    </Overlay>
  )
}
