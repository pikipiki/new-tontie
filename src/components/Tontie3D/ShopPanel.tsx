import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { SHOP_OFFERS } from '@game/shop'
import type { TontieGame } from '@/hooks/useTontieGame'
import { INK, themeColors } from './theme'
import { Overlay } from './ui'
import { Description, ExitCell, OfferCell } from './shopCells'
import { ShopSign, Wallet } from './shopWidgets'
import { WOOD_DARK } from './shopTheme'

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
            boxShadow: `0 8px 0 ${INK}, inset 0 0 0 3px ${themeColors.shopInsetGlow}, 0 24px 40px ${themeColors.shopShelfShadow}`,
          }}
        >
          {SHOP_OFFERS.map((offer, offerIndex) => (
            <OfferCell key={offer.id} game={game} index={offerIndex} />
          ))}
          <ExitCell game={game} />
        </Box>
        <Description game={game} />
      </Box>
    </Overlay>
  )
}
