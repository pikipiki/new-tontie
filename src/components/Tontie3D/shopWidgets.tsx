import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SHOP_OFFERS } from '@/game/shop'
import { SHOP_FLASH_MS } from '@game3d/fx'
import type { TontieGame } from '@/hooks/useTontieGame'
import { CoinIcon } from './ShopIcon'
import {
  cartoonText,
  INK,
  PAPER,
  RED,
  themeColors,
  WHITE,
  YELLOW,
} from './theme'
import { WOOD } from './shopTheme'

export function KeyBadge({ children }: { children: ReactNode }) {
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
        bgcolor: themeColors.purpleOverlayLight,
        color: WHITE,
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
export function ShopSign() {
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
          boxShadow: `0 6px 0 ${INK}, inset 0 3px 0 ${themeColors.shopWalletInset}`,
          ...cartoonText(YELLOW, INK, 6),
          fontSize: 'clamp(24px, 4.6vh, 36px)',
        }}
      >
        {t('game.shopTitle')}
      </Box>
    </Box>
  )
}

export function Wallet({ game }: { game: TontieGame }) {
  const { t } = useTranslation()
  const flash = game.gameFx.shop
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
          sx={{
            fontSize: 12,
            color: themeColors.purpleMuted,
            letterSpacing: 0.5,
          }}
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
