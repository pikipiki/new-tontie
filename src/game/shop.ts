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
    apply: (s) => {
      if (s.hammerLv >= 2) return false
      s.hammerLv = 2
      s.bronze = true
      return true
    },
  },
  {
    id: 'hammer3',
    label: 'Silver hammer (lv3)',
    price: PRICES[1] ?? 50,
    apply: (s) => {
      if (s.hammerLv >= 3) return false
      s.hammerLv = 3
      s.silver = true
      return true
    },
  },
  {
    id: 'hammer4',
    label: 'Gold hammer (lv4)',
    price: PRICES[2] ?? 80,
    apply: (s) => {
      if (s.hammerLv >= 4) return false
      s.hammerLv = 4
      s.gold = true
      return true
    },
  },
  {
    id: 'heart1',
    label: 'Heart +8',
    price: PRICES[3] ?? 90,
    apply: (s) => {
      heal(s, 8)
      return true
    },
  },
  {
    id: 'wing',
    label: 'Wing',
    price: PRICES[4] ?? 120,
    apply: (s) => {
      s.wing = true
      return true
    },
  },
  {
    id: 'heart2',
    label: 'Heart +16',
    price: PRICES[5] ?? 150,
    apply: (s) => {
      heal(s, 16)
      return true
    },
  },
  {
    id: 'continue',
    label: 'Continue +1',
    price: PRICES[6] ?? 200,
    apply: (s) => {
      s.continues += 1
      return true
    },
  },
  {
    id: 'heart3',
    label: 'Full heal',
    price: PRICES[7] ?? 300,
    apply: (s) => {
      s.hp = s.hpMax
      return true
    },
  },
]

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
