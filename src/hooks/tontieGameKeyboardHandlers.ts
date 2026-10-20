import { numpadToHole } from '@game/engine'
import { SHOP_OFFERS } from '@game/shop'
import type { GameState, HoleIndex } from '@game/types'
import {
  SHOP_CELLS,
  SHOP_EXIT_INDEX,
  SHOP_MOVES,
} from './useTontieGameConstants'

export function handleLevelIntroKey(
  event: KeyboardEvent,
  start: () => void,
): boolean {
  if (event.key === 'Enter' || event.key === ' ' || event.key === '0') {
    start()
    event.preventDefault()
    return true
  }
  return false
}

export function handleShopKey(
  event: KeyboardEvent,
  state: GameState,
  shopIndex: number,
  setShopIndex: (index: number | ((current: number) => number)) => void,
  buy: (index: number) => void,
  leaveShop: () => void,
): boolean {
  if (state.phase !== 'shop') {
    return false
  }
  const move = SHOP_MOVES[event.key]
  if (move !== undefined) {
    setShopIndex((index) => Math.min(SHOP_CELLS - 1, Math.max(0, index + move)))
    event.preventDefault()
    return true
  }
  if (event.key === 'Enter' || event.key === ' ') {
    if (shopIndex === SHOP_EXIT_INDEX) leaveShop()
    else buy(shopIndex)
    event.preventDefault()
    return true
  }
  if (event.key === '0' || event.key === 'Escape') {
    leaveShop()
    event.preventDefault()
    return true
  }
  const digit = Number(event.key)
  if (digit >= 1 && digit <= SHOP_OFFERS.length) {
    buy(digit - 1)
    event.preventDefault()
    return true
  }
  return false
}

export function handlePlayingKey(
  event: KeyboardEvent,
  pause: () => void,
  hit: (hole: HoleIndex) => void,
): boolean {
  if (event.key === '0' || event.key === 'Escape' || event.key === 'p') {
    pause()
    event.preventDefault()
    return true
  }
  const hole = numpadToHole(event.key)
  if (hole !== null) {
    hit(hole)
    event.preventDefault()
    return true
  }
  return false
}
