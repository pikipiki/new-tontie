import gameSpec from '../../reference/game-spec.json'
import { heal } from './combat'
import type { GameState } from './types'

export interface ShopOffer {
  id: string
  label: string
  price: number
  apply: (state: GameState) => boolean
}

const PRICES = gameSpec.shopPrices

export const SHOP_OFFERS: ShopOffer[] = [
  {
    id: 'hammer2',
    label: 'Bronze hammer (lv2)',
    price: PRICES[0] ?? 10,
    apply: (state) => {
      if (state.hammerLv >= 2) return false
      state.hammerLv = 2
      state.bronze = true
      return true
    },
  },
  {
    id: 'hammer3',
    label: 'Silver hammer (lv3)',
    price: PRICES[1] ?? 50,
    apply: (state) => {
      if (state.hammerLv >= 3) return false
      state.hammerLv = 3
      state.silver = true
      return true
    },
  },
  {
    id: 'hammer4',
    label: 'Gold hammer (lv4)',
    price: PRICES[2] ?? 80,
    apply: (state) => {
      if (state.hammerLv >= 4) return false
      state.hammerLv = 4
      state.gold = true
      return true
    },
  },
  {
    id: 'heart1',
    label: 'Heart +8',
    price: PRICES[3] ?? 90,
    apply: (state) => {
      heal(state, 8)
      return true
    },
  },
  {
    id: 'wing',
    label: 'Wing',
    price: PRICES[4] ?? 120,
    apply: (state) => {
      if (state.wing) return false
      state.wing = true
      return true
    },
  },
  {
    id: 'heart2',
    label: 'Heart +16',
    price: PRICES[5] ?? 150,
    apply: (state) => {
      heal(state, 16)
      return true
    },
  },
  {
    id: 'continue',
    label: 'Continue +1',
    price: PRICES[6] ?? 200,
    apply: (state) => {
      state.continues += 1
      return true
    },
  },
  {
    id: 'heart3',
    label: 'Full heal',
    price: PRICES[7] ?? 300,
    apply: (state) => {
      state.hp = state.hpMax
      return true
    },
  },
]

/** Hammer tier an offer sells (hammer2 → 2), or null for consumables. */
export function offerHammerLv(offer: ShopOffer): number | null {
  const match = /^hammer(\d)$/.exec(offer.id)
  return match ? Number(match[1]) : null
}

/** Hammers at or below the current tier and an already-earned wing can't be bought again. */
export function offerOwned(state: GameState, offer: ShopOffer): boolean {
  const hammerLevel = offerHammerLv(offer)
  if (hammerLevel !== null) return state.hammerLv >= hammerLevel
  return offer.id === 'wing' && state.wing
}

export function buyShopOffer(state: GameState, index: number): boolean {
  const offer = SHOP_OFFERS[index]
  if (!offer || state.money < offer.price) {
    return false
  }
  if (!offer.apply(state)) {
    return false
  }
  state.money -= offer.price
  return true
}
