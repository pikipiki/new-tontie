import runtime from '@/config/runtime.json'
import { SHOP_OFFERS } from '@game/shop'

/** Shop grid: the offers, then EXIT in the last cell (3 columns). */
export const SHOP_CELLS = SHOP_OFFERS.length + 1
export const SHOP_EXIT_INDEX = SHOP_OFFERS.length
const SHOP_COLUMNS = 3

export const SHOP_MOVES: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -SHOP_COLUMNS,
  ArrowDown: SHOP_COLUMNS,
}

/** Avoid a burst of catch-up ticks after the tab was in the background. */
export const MAX_CATCH_UP_MS = runtime.maxCatchUpMs
