import gameSpec from '../../../reference/game-spec.json'
import { heal } from '../stats'
import type { ShopOfferFeature } from './types'

const PRICES = gameSpec.shopPrices

function hammerShopOffers(): ShopOfferFeature[] {
  return [
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
  ]
}

function consumableShopOffers(): ShopOfferFeature[] {
  return [
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
}

/** Default Flash-faithful shop rows (registered at boot). */
export function createBuiltinShopOffers(): ShopOfferFeature[] {
  return [...hammerShopOffers(), ...consumableShopOffers()]
}
